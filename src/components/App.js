import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {getAccountId, getImpersonatedEmail} from '../state/user/selectors';
import {userInfoFetch} from '../state/user/actions';
import Bar from './Bar';
import Board from './Board';
import Wait from './Wait';
import Failure from './Failure';
import Login from './Login';
import {getInfoMessage, getIsInitialized, getIsOthers} from '../state/app/selectors';
import {Snackbar} from '@mui/material';
import {infoMessageHide} from '../state/app/actions';
import Other from './Other';
import Hours from './Hours';
import {getAccounts} from '../state/accounts/selectors';
import Search from './Search';

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class App extends React.PureComponent {
    render() {
        const {isInitialized, accountId, infoMessage, isOthers, accounts, impersonatedEmail} = this.props;
        if (!isInitialized) {
            return null;
        }
        if (!accountId) {
            return <Login />;
        }
        return (
            <>
                <Bar />
                <Hours />
                <Search />
                <Board accountId={accountId} isEditable={!Boolean(impersonatedEmail)} />
                {isOthers && Object.keys(accounts).map((accountId) => <Other key={accountId} accountId={accountId} />)}
                <Wait />
                <Failure />
                <Snackbar
                    open={!!infoMessage}
                    message={infoMessage}
                    autoHideDuration={1000}
                    onClose={this.onSnackbarClose}
                />
            </>
        );
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(userInfoFetch());
        window.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    onSnackbarClose = () => {
        const {dispatch} = this.props;
        dispatch(infoMessageHide());
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
App.propTypes = exact({
    // --------------------------------- redux:
    isInitialized: PropTypes.bool.isRequired,
    accountId: PropTypes.string.isRequired,
    infoMessage: PropTypes.string.isRequired,
    isOthers: PropTypes.bool.isRequired,
    accounts: PropTypes.object.isRequired,
    impersonatedEmail: PropTypes.string.isRequired,
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState) => ({
    isInitialized: getIsInitialized(appState),
    accountId: getAccountId(appState),
    infoMessage: getInfoMessage(appState),
    isOthers: getIsOthers(appState),
    accounts: getAccounts(appState),
    impersonatedEmail: getImpersonatedEmail(appState),
});

export default connect(mapStateToProps)(App);
