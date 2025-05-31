import {
    ERROR_HIDE,
    INFO_MESSAGE_HIDE,
    INFO_MESSAGE_SHOW,
    OTHERS_TOGGLE,
    SEARCH_CHANGE,
    TIME_TRAVEL,
} from '../action-types';

export const timeTravel = (timestamp) => ({
    type: TIME_TRAVEL,
    timestamp,
});

export const infoMessageShow = (text) => ({
    type: INFO_MESSAGE_SHOW,
    text,
});

export const infoMessageHide = () => ({
    type: INFO_MESSAGE_HIDE,
});

export const othersToggle = () => ({
    type: OTHERS_TOGGLE,
});

export const searchChange = (value) => ({
    type: SEARCH_CHANGE,
    value,
});

export const errorHide = () => ({
    type: ERROR_HIDE,
});
