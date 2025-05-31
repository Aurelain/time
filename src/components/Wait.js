import * as React from 'react';
import {connect} from 'react-redux';
import {Box} from '@mui/material';
import {STATUS_REQUESTING} from '../constants';
import {getStatus} from '../state/app/selectors';

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
        background: 'rgba(255,255,255,0.5)',
        zIndex: 999,
    },
    spinner: {
        position: 'fixed',
        left: '50%',
        top: '50%',
        margin: '-12px 0 0 -12px',
        width: '24px',
        height: '24px',
        animation: 'animationSpinner infinite linear .75s',
        borderRadius: '100%',
        border: '2px solid #0052cc',
        borderTopColor: 'transparent',
        boxSizing: 'border-box',
    },
    '@keyframes animationSpinner': {
        '0%': {
            transform: 'rotate(0deg)',
        },
        '100%': {
            transform: 'rotate(360deg)',
        },
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Wait extends React.PureComponent {
    render() {
        const {status} = this.props;
        if (status === STATUS_REQUESTING) {
            return (
                <Box sx={SX.root}>
                    <Box sx={SX.spinner} />
                </Box>
            );
        } else {
            return null;
        }
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
// interface Props {
//     status: string,
//     classes: Classes<typeof styles>;
// }
const mapStateToProps = (appState) => ({
    status: getStatus(appState),
});

export default connect(mapStateToProps)(Wait);
