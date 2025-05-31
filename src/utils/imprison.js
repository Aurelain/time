/**
 *
 */
const imprison = (nr, low, high) => {
    return Math.min(Math.max(nr, low), high);
};

export default imprison;
