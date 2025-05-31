import {getParsedSearch, getTimestamp} from '../app/selectors';
import {MILLISECONDS_IN_A_DAY} from '../../constants';
import convertTimestampToPercent from '../../system/convertTimestampToPercent';
import {SEARCH_DEFAULT, SEARCH_WORKED} from '../../system/CONSTANTS';
import isEmpty from '../../utils/isEmpty';

// =====================================================================================================================
//  S E L E C T O R S
// =====================================================================================================================
export const getIssuesRepository = (state) => state.issues.repository;

export const getIssuesSelected = (state) => state.issues.selected;

export const getIssueWatchers = (state, code) => state.issues.repository[code].watchers;

export const getIssueSummary = (state, code) => state.issues.repository[code].summary;

export const getIssueIconUrl = (state, code) => state.issues.repository[code].iconUrl;

export const getIssueWorklogs = (state, code) => state.issues.repository[code].worklogs;

export const reselectIssuesDay = (state, accountId) => {
    const repository = getIssuesRepository(state);
    const morning = getTimestamp(state);
    const selected = getIssuesSelected(state);
    const parsedSearch = getParsedSearch(state);
    const visibleIssues = computeVisibleIssues(repository, morning, accountId, selected, parsedSearch);
    const forbiddenIntervals = computeForbidden(visibleIssues, morning);
    return {
        visibleIssues,
        totals: computeTotals(repository, visibleIssues),
        forbiddenIntervals,
        forbiddenSum: splitTime(computeSum(forbiddenIntervals)),
        groups: computeGroups(repository, visibleIssues, accountId),
    };
};

// =====================================================================================================================
//  H E L P E R S
// =====================================================================================================================
/**
 * TODO: cleanup
 */
const computeVisibleIssues = (repository, timestamp, accountId, selected, parsedSearch) => {
    const list = [];
    for (const code in repository) {
        const issue = repository[code];
        const intervals = computeIntervals(issue.worklogs, timestamp, accountId);
        let isVisible = false;
        const searchKey = parsedSearch + '@' + accountId;
        switch (parsedSearch) {
            case SEARCH_DEFAULT:
                if (intervals.length || issue.searches[searchKey] || code === selected) {
                    isVisible = true;
                }
                break;
            case SEARCH_WORKED:
                if (intervals.length) {
                    isVisible = true;
                }
                break;
            default:
                if (issue.searches[searchKey]) {
                    isVisible = true;
                }
        }
        if (isVisible) {
            list.push({
                code: issue.code,
                intervals,
            });
        }
    }
    return list;
};

/**
 * - beginTimestamp = B
 * - endTimestamp = E
 * - morningTimestamp = M
 * - nightTimestamp = N
 * There are only 6 possibilities:
 *      1) --------B--------E--------M--------N-------- (Not OK)
 *      2) --------B--------M--------E--------N-------- [ME]
 *      3) --------B--------M--------N--------E-------- [MN] (unlikely)
 *      4) --------M--------B--------E--------N-------- [BE]
 *      5) --------M--------B--------N--------E-------- [BN]
 *      6) --------M--------N--------B--------E-------- (Not OK)
 */
const computeIntervals = (worklogs, timestamp, currentAccountId) => {
    const list = [];
    const M = timestamp;
    const N = timestamp + MILLISECONDS_IN_A_DAY;
    for (const worklogId in worklogs) {
        const {accountId, begin: B, end: E} = worklogs[worklogId];
        if (accountId === currentAccountId) {
            if (M < E && N > B) {
                const begin = Math.max(B, M);
                const end = Math.min(E, N);
                list.push({
                    begin,
                    end,
                    left: convertTimestampToPercent(M, begin) + '%',
                    right: 100 - convertTimestampToPercent(M, end) + '%',
                });
            }
        }
    }
    return list;
};

/**
 *
 */
const computeForbidden = (visibleIssues, morning) => {
    const linear = [];
    for (const {intervals} of visibleIssues) {
        for (const {begin, end} of intervals) {
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
    }
    linear.sort(sorter);
    const forbidden = [];
    let begin = 0;
    let depth = 0;
    for (const {value, isBegin} of linear) {
        if (isBegin) {
            depth++;
            if (depth === 1) {
                begin = value;
            }
        } else {
            depth--;
            if (depth === 0) {
                forbidden.push({
                    begin,
                    end: value,
                    left: convertTimestampToPercent(morning, begin) + '%',
                    right: 100 - convertTimestampToPercent(morning, value) + '%',
                });
            }
        }
    }
    return forbidden;
};

/**
 *
 */
const sorter = (a, b) => {
    if (a.value < b.value) {
        return -1;
    } else {
        return 1;
    }
};

/**
 *
 */
const computeTotals = (repository, visibleIssues) => {
    const totals = {};
    for (const {code} of visibleIssues) {
        let total = 0;
        const worklogs = repository[code].worklogs;
        for (const worklogId in worklogs) {
            const {begin, end} = worklogs[worklogId];
            total += end - begin;
        }
        totals[code] = total;
    }
    return totals;
};

/**
 *
 */
const computeGroups = (repository, visibleIssues, accountId) => {
    let watched = {};
    let others = {};
    let frozen = {};
    let normal = {};
    for (const {code} of visibleIssues) {
        const {assignee, watchers, priority} = repository[code];
        if (!isEmpty(watchers)) {
            watched[code] = true;
        } else if (assignee !== accountId) {
            others[code] = true;
        } else if (priority === 'Lowest') {
            frozen[code] = true;
        } else {
            normal[code] = true;
        }
    }
    return {normal, frozen, watched, others};
};

/**
 *
 */
const splitTime = (milliseconds) => {
    const iso = new Date(milliseconds).toISOString();
    const hours = iso.substr(11, 2);
    const minutes = iso.substr(14, 2);
    return {
        hours: Number(hours),
        minutes: Number(minutes),
    };
};

/**
 *
 */
const computeSum = (forbidden) => {
    let total = 0;
    for (const {begin, end} of forbidden) {
        total += end - begin;
    }
    return total;
};
