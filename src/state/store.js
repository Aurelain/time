import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';

import accounts from './accounts/reducer';
import app from './app/reducer';
import user from './user/reducer';
import issues from './issues/reducer';

const rootReducer = combineReducers({
    accounts,
    app,
    user,
    issues,
});

const middlewares = [thunkMiddleware];
const middleWareEnhancer = applyMiddleware(...middlewares);
const store = createStore(rootReducer, composeWithDevTools(middleWareEnhancer));

export default store;
