import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import {userLogin} from '../state/user/actions';
import {getErrorMessage, getIsLoggingIn} from '../state/app/selectors';

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Login extends React.PureComponent {
    emailRef = React.createRef();
    tokenRef = React.createRef();

    render() {
        const {errorMessage, isLoggingIn} = this.props;
        return (
            <Dialog open={true}>
                <DialogTitle>Time Manager</DialogTitle>
                <DialogContent>
                    <TextField
                        inputRef={this.emailRef}
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        defaultValue={localStorage.getItem('email')}
                    />
                    <TextField
                        inputRef={this.tokenRef}
                        margin="dense"
                        id="password"
                        label="Token"
                        type="password"
                        fullWidth
                        variant="standard"
                        defaultValue={localStorage.getItem('token')}
                    />
                </DialogContent>
                <DialogActions>
                    {errorMessage && (
                        <Alert sx={{padding: '0 8px'}} severity="error">
                            {errorMessage}
                        </Alert>
                    )}
                    <Button onClick={this.onLoginClick}>{isLoggingIn ? <CircularProgress /> : 'Login'}</Button>
                </DialogActions>
            </Dialog>
        );
    }

    onLoginClick = () => {
        const {dispatch} = this.props;
        dispatch(userLogin(this.emailRef.current.value, this.tokenRef.current.value));
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Login.propTypes = exact({
    isLoggingIn: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string.isRequired,
    // ----------------------------
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState) => ({
    isLoggingIn: getIsLoggingIn(appState),
    errorMessage: getErrorMessage(appState),
});

export default connect(mapStateToProps)(Login);
