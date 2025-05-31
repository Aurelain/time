/**
 * Performs deep strict equality between two values.
 * This function should perform better than lodash (see https://github.com/lodash/lodash/issues/3710).
 */
const isEqual = (a, b) => {
    const type = typeof a;
    if (type !== typeof b) {
        return false;
    }
    if (type !== 'object') {
        return a === b;
    }
    if (a === null || b === null) {
        return a === b;
    }
    if (Array.isArray(a)) {
        const len = a.length;
        if (len !== b.length) {
            return false;
        }
        for (let i = len - 1; i >= 0; i--) {
            if (!isEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    for (const key in a) {
        if (!(key in b)) {
            return false;
        }
        if (!isEqual(a[key], b[key])) {
            return false;
        }
    }
    for (const key in b) {
        if (!(key in a)) {
            return false;
        }
    }
    return true;
};

export default isEqual;
