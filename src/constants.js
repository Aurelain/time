export const ISSUE_HEAD_WIDTH = 320;
export const SCROLLBAR_WIDTH = 17;
export const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;
export const MILLISECONDS_IN_AN_HOUR = 1000 * 60 * 60;
export const MILLISECONDS_IN_A_MINUTE = 1000 * 60;

export const STATUS_NORMAL = 'STATUS_NORMAL';
export const STATUS_REQUESTING = 'STATUS_REQUESTING';
export const STATUS_FAILED = 'STATUS_FAILED';

// The following values have been obtained through `btoa('actual_value')`. Funny security, right?
// prettier-ignore
// eslint-disable-next-line max-len
export const JIRA_URL = atob('aHR0cHM6Ly9hdXJlbGFpbi5hdGxhc3NpYW4ubmV0');
export const PROXY_URL = atob('aHR0cHM6Ly9hc2NlbmRpYS5yby93b3JrL3Byb3h5L2ppcmEucGhw');
