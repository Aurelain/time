import subtract from './subtract';

/**
 *
 * @returns {object|null}
 */
const spawnWorklogs = ({worklogs, accountId, isAddition, selection}) => {
    if (isAddition) {
        return add(worklogs, accountId, selection);
    } else {
        return remove(worklogs, accountId, selection);
    }
};

/**
 *
 */
const add = (worklogs, currentAccountId, selection) => {
    const result = {};
    const linear = [];
    for (const {begin, end} of selection) {
        linear.push(
            {
                value: begin,
                isBegin: true,
            },
            {
                value: end,
                isBegin: false,
            }
        );
    }
    for (const id in worklogs) {
        const worklog = worklogs[id];
        if (worklog.accountId !== currentAccountId) {
            result[id] = worklog;
            continue;
        }
        const {begin, end} = worklog;
        linear.push(
            {
                id,
                value: begin,
                isBegin: true,
            },
            {
                id,
                value: end,
                isBegin: false,
            }
        );
    }
    linear.sort(sorter);
    let rank = 0;
    let pendingId = '';
    let pendingBegin = 0;
    let hasChanged = false;
    for (const {id, value, isBegin} of linear) {
        if (isBegin) {
            rank++;
            if (rank === 1) {
                pendingId = id;
                pendingBegin = value;
            }
        } else {
            rank--;
            if (rank === 0) {
                const isOld = id && id === pendingId;
                if (!isOld) {
                    hasChanged = true;
                }
                const resultedId = isOld ? id : generateName(pendingBegin, value);
                result[resultedId] = {
                    worklogId: resultedId,
                    accountId: currentAccountId,
                    begin: pendingBegin,
                    end: value,
                };
            }
        }
    }
    return hasChanged ? result : null;
};

/**
 *
 */
const sorter = (a, b) => {
    if (a.value < b.value) {
        return -1;
    } else {
        if (a.value > b.value) {
            return 1;
        }
        if (!a.isBegin && b.isBegin) {
            // When `a` is an ending and `b` is a beginning (both with the same value), place the beginning first, so
            // they're forced to overlap (so we get merged intervals, instead of consecutive intervals)
            return 1;
        } else {
            return -1;
        }
    }
};

/**
 *
 */
const remove = (worklogs, currentAccountId, selection) => {
    const {begin: b, end: e} = selection[0];
    const result = {};
    let hasChanged = false;
    for (const id in worklogs) {
        const worklog = worklogs[id];
        if (worklog.accountId !== currentAccountId) {
            result[id] = worklog;
            continue;
        }
        const {begin, end} = worklog;
        const subtractionResult = subtract(begin, end, b, e);
        switch (subtractionResult) {
            case null: {
                // completely removed
                hasChanged = true;
                break;
            }
            case false: {
                // nothing changed
                result[id] = worklog;
                break;
            }
            default: {
                // we have new intervals
                hasChanged = true;
                for (const item of subtractionResult) {
                    const tempId = generateName(item.begin, item.end);
                    result[tempId] = {
                        worklogId: tempId,
                        accountId: currentAccountId,
                        begin: item.begin,
                        end: item.end,
                    };
                }
            }
        }
    }
    return hasChanged ? result : null;
};

/**
 *
 */
const generateName = (begin, end) => {
    return `temp_${begin}_${end}`;
};

export default spawnWorklogs;
