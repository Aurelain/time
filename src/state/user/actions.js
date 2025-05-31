import {
    IMPERSONATED_EMAIL_CHANGE,
    USER_INFO_FETCH_ERROR,
    USER_INFO_FETCH_REQUEST,
    USER_INFO_FETCH_SUCCESS,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
} from '../action-types';
import ajax from '../../utils/ajax';
import {issuesAvailableFetch} from '../issues/actions';
import {getImpersonatedEmail} from './selectors';

/**
 *
 */
export const userInfoFetch = () => async (dispatch, getState) => {
    dispatch({
        type: USER_INFO_FETCH_REQUEST,
    });

    const impersonatedEmail = getImpersonatedEmail(getState());
    const email = impersonatedEmail || localStorage.getItem('email');

    const {payload, error} = await ajax('user/search?query=' + email);
    // const propertiesResult = await ajax(`user/properties?accountId=5b4f54a4e3411b2c26e5f222`);
    // console.log('propertiesResult:', propertiesResult);

    // Reveal root element:
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.parentNode.removeChild(spinner);
        document.getElementById('root').style.visibility = 'visible';
    }

    if (error) {
        dispatch({
            type: USER_INFO_FETCH_ERROR,
            error,
        });
        return;
    }

    if (payload.length !== 1) {
        console.log('Automated login failed:', payload);
        dispatch({
            type: USER_INFO_FETCH_ERROR,
            error: 'User not found!',
        });
        return;
    }

    dispatch({
        type: USER_INFO_FETCH_SUCCESS,
        info: payload[0],
    });

    dispatch(issuesAvailableFetch());
};

/**
 *
 */
export const userLogin = (email, token) => async (dispatch) => {
    localStorage.setItem('email', email);
    localStorage.setItem('token', token);

    dispatch({
        type: USER_LOGIN_REQUEST,
    });
    const {payload, error} = await ajax('user/search?query=' + localStorage.getItem('email'));

    if (error) {
        dispatch({
            type: USER_LOGIN_ERROR,
            error,
        });
        return;
    }

    if (payload.length !== 1) {
        dispatch({
            type: USER_LOGIN_ERROR,
            error: 'User not found!',
        });
        return;
    }

    dispatch({
        type: USER_LOGIN_SUCCESS,
        info: payload[0],
    });

    dispatch(issuesAvailableFetch());
};

/**
 *
 */
export const impersonatedEmailChange = (value) => ({
    type: IMPERSONATED_EMAIL_CHANGE,
    value,
});
