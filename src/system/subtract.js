const LEFT = 'left';
const ALL = 'all';
const MIDDLE = 'middle';
const RIGHT = 'right';

/**
 * Intersects two intervals and returns the result (A-B).
 * @returns {array|false|null}
 *          - if the interval has changed due to the deletion: [{begin:number, end:number}] (one or two items)
 *          - if the interval isn't affected by the deletion: false
 *          - if the interval doesn't exist anymore after the deletion: null
 */
const subtract = (targetBegin, targetEnd, deletionBegin, deletionEnd) => {
    const intersectionType = computeIntersectionType(deletionBegin, deletionEnd, targetBegin, targetEnd);
    if (!intersectionType) {
        return false;
    }
    switch (intersectionType) {
        case ALL:
            return null;
        case LEFT:
            return [
                {
                    begin: deletionEnd,
                    end: targetEnd,
                },
            ];
        case MIDDLE:
            return [
                {
                    begin: targetBegin,
                    end: deletionBegin,
                },
                {
                    begin: deletionEnd,
                    end: targetEnd,
                },
            ];
        case RIGHT:
            return [
                {
                    begin: targetBegin,
                    end: deletionBegin,
                },
            ];
        default:
        // impossible
    }
};

/**
 * - B = deletion begin
 * - E = deletion end
 * - M = existing begin
 * - N = existing end
 * There are only 6 possibilities:
 *      1) --------B--------E--------M--------N-------- null (Not intersected)
 *      2) --------B--------M--------N--------E-------- ALL
 *      3) --------B--------M--------E--------N-------- LEFT
 *      4) --------M--------B--------E--------N-------- MIDDLE
 *      5) --------M--------B--------N--------E-------- RIGHT
 *      6) --------M--------N--------B--------E-------- null (Not intersected)
 */
const computeIntersectionType = (B, E, M, N) => {
    if (B <= M && N <= E) {
        return ALL;
    } else if (B <= M && M < E && E < N) {
        return LEFT;
    } else if (M < B && E < N) {
        return MIDDLE;
    } else if (M < B && B < N && N <= E) {
        return RIGHT;
    } else {
        return null;
    }
};

export default subtract;
