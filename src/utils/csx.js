/**
 *
 */
const csx = (...args) => {
    const output = {};
    for (const item of args) {
        if (item) {
            Object.assign(output, item);
        }
    }
    return output;
};

export default csx;
