import {MILLISECONDS_IN_A_DAY, MILLISECONDS_IN_AN_HOUR} from '../constants';
import PERCENTS from './PERCENTS';

/**
 *
 * @returns {null|number}
 */
const convertTimestampToPercent = (morningTimestamp, targetTimestamp) => {
    if (targetTimestamp < morningTimestamp || targetTimestamp > morningTimestamp + MILLISECONDS_IN_A_DAY) {
        return null;
    }
    const delta = targetTimestamp - morningTimestamp;
    let cursorMilliseconds = 0;
    let cursorPercent = 0;
    for (let i = 0; i < PERCENTS.length; i++) {
        const currentPercent = PERCENTS[i];
        if (cursorMilliseconds + MILLISECONDS_IN_AN_HOUR < delta) {
            cursorMilliseconds += MILLISECONDS_IN_AN_HOUR;
            cursorPercent += currentPercent;
        } else {
            const overflowRatio = (delta - cursorMilliseconds) / MILLISECONDS_IN_AN_HOUR;
            cursorPercent += currentPercent * overflowRatio;
            break;
        }
    }
    return cursorPercent;
};

export default convertTimestampToPercent;
