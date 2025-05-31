import {ISSUE_HEAD_WIDTH} from '../constants';
import imprison from '../utils/imprison';

/**
 *
 * @returns {number}
 */
const convertEventToPercent = ({clientX}) => {
    const percent = (100 * (clientX - ISSUE_HEAD_WIDTH)) / (document.body.offsetWidth - ISSUE_HEAD_WIDTH);
    return imprison(percent, 0, 100);
};

export default convertEventToPercent;
