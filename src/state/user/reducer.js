import {combine, reduce} from '../utils';
import {IMPERSONATED_EMAIL_CHANGE, USER_INFO_FETCH_SUCCESS, USER_LOGIN_SUCCESS} from '../action-types';

/**
 *
 */
const accountId = reduce(
    '',
    {
        [USER_INFO_FETCH_SUCCESS]: (state, {info}) => info.accountId,
        [USER_LOGIN_SUCCESS]: USER_INFO_FETCH_SUCCESS,
    },
    'user.accountId'
);

/**
 *
 */
const avatar = reduce(
    '',
    {
        [USER_INFO_FETCH_SUCCESS]: (state, {info}) => info.avatarUrls['32x32'],
        [USER_LOGIN_SUCCESS]: USER_INFO_FETCH_SUCCESS,
    },
    'user.accountId'
);

/**
 *
 */
const impersonatedEmail = reduce(
    '',
    {
        [IMPERSONATED_EMAIL_CHANGE]: (state, {value}) => value,
    },
    'user.impersonatedEmail'
);

export default combine({
    accountId,
    avatar,
    impersonatedEmail,
});
