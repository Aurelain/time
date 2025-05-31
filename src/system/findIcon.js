import icon10303 from '../icons/10303.png';
import icon10310 from '../icons/10310.png';
import icon10316 from '../icons/10316.png';
import icon10318 from '../icons/10318.png';
import icon10563 from '../icons/10563.png';
import icon10564 from '../icons/10564.png';
import icon10565 from '../icons/10565.png';
import icon10567 from '../icons/10567.png';
import icon10569 from '../icons/10569.png';
import icon10570 from '../icons/10570.png';
import icon10571 from '../icons/10571.png';
import icon10572 from '../icons/10572.png';

const PATTERNS = [
    {pattern: /10303/, icon: icon10303},
    {pattern: /10310/, icon: icon10310},
    {pattern: /10316/, icon: icon10316},
    {pattern: /10318/, icon: icon10318},
    {pattern: /10563/, icon: icon10563},
    {pattern: /10564/, icon: icon10564},
    {pattern: /10565/, icon: icon10565},
    {pattern: /10567/, icon: icon10567},
    {pattern: /10569/, icon: icon10569},
    {pattern: /10570/, icon: icon10570},
    {pattern: /10571/, icon: icon10571},
    {pattern: /10572/, icon: icon10572},
];
const DEFAULT_ICON = icon10318;

/**
 *
 *
 */
const findIcon = (url) => {
    for (const {pattern, icon} of PATTERNS) {
        if (url.match(pattern)) {
            return icon;
        }
    }
    return DEFAULT_ICON;
};

export default findIcon;
