import {MILLISECONDS_IN_A_MINUTE, MILLISECONDS_IN_AN_HOUR} from '../constants';

const prettyDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / MILLISECONDS_IN_AN_HOUR);
    const rest = milliseconds - hours * MILLISECONDS_IN_AN_HOUR;
    const minutes = Math.round(rest / MILLISECONDS_IN_A_MINUTE);
    return hours + 'h ' + minutes.toString().padStart(2, '0') + 'm';
};

export default prettyDuration;
