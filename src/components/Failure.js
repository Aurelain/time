import * as React from 'react';
import {connect} from 'react-redux';
import {Box, Button} from '@mui/material';

import {STATUS_FAILED} from '../constants';
import {getErrorMessage, getStatus} from '../state/app/selectors';
import {errorHide} from '../state/app/actions';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        padding: 32,
    },
    button: {
        maxWidth: 100,
        color: '#fff',
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Failure extends React.PureComponent {
    render() {
        const {status, errorMessage} = this.props;
        if (status === STATUS_FAILED) {
            return (
                <Box sx={SX.root}>
                    {errorMessage}
                    <Button sx={SX.button} onClick={this.onOkClick}>
                        OK
                    </Button>
                </Box>
            );
        } else {
            return null;
        }
    }

    onOkClick = () => {
        const {dispatch} = this.props;
        dispatch(errorHide());
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
// interface Props {
//     status: string,
//     errorMessage: string,
// ----------------------------
// classes: Classes<typeof styles>;
// }
const mapStateToProps = (appState) => ({
    status: getStatus(appState),
    errorMessage: getErrorMessage(appState),
});

export default connect(mapStateToProps)(Failure);
