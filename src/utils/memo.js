import memoize from 'memoize-one';

/**
 *
 */
const memo = () => {
    return memoize((...args) => {
        const output = {};
        for (const item of args) {
            if (item) {
                Object.assign(output, item);
            }
        }
        return output;
    });
};

export default memo;
