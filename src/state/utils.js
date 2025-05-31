import {combineReducers} from 'redux';

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @param  {string}   name           The name of the reducer, useful only for debugging.
 * @return {Function}                Reducer function
 */
export const reduce = (initialState, handlers, name = 'unknown') => {
    return (state = initialState, action) => {
        return handle(state, action, handlers, name);
    };
};

/**
 *
 */
const handle = (state, action, handlers) => {
    const {type} = action;

    if ('type' in action && !type) {
        throw new Error('Reducer called with undefined type!');
    }

    if (handlers.hasOwnProperty(type)) {
        let handler = handlers[type];
        if (typeof handler === 'string' && handlers[handler]) {
            handler = handlers[handler];
        }
        return typeof handler === 'function' ? handler(state, action) : handler;
    }

    return state;
};

/**
 * Alias for the official combineReducers class offered by Redux.
 * In the future, we may augment this function (similar to Calypso).
 *
 * @param {object} reducers - object containing the reducers to merge
 * @returns {function} - Returns the combined reducer function
 */
export const combine = (reducers) => combineReducers(reducers);
