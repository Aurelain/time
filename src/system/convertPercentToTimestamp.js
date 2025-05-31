import {MILLISECONDS_IN_A_DAY, MILLISECONDS_IN_AN_HOUR} from '../constants';
import PERCENTS from './PERCENTS';

/**
 *
 * @returns {number}
 */
const convertPercentToTimestamp = (morningTimestamp, percent) => {
    let cursorPercent = 0;
    for (let i = 0; i < PERCENTS.length; i++) {
        const currentPercent = PERCENTS[i];
        if (cursorPercent + currentPercent < percent) {
            cursorPercent += currentPercent;
        } else {
            const overflowMilliseconds = (MILLISECONDS_IN_AN_HOUR * (percent - cursorPercent)) / currentPercent;
            return morningTimestamp + Math.round(MILLISECONDS_IN_AN_HOUR * i + overflowMilliseconds);
        }
    }
    return morningTimestamp + MILLISECONDS_IN_A_DAY;
};

export default convertPercentToTimestamp;
