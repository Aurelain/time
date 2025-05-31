import * as React from 'react';
import {connect} from 'react-redux';
import {Box} from '@mui/material';
import exact from 'prop-types-exact';
import PropTypes from 'prop-types';
import {getAccountAvatar, getAccountName} from '../state/accounts/selectors';
import Board from './Board';
import {reselectIssuesDay} from '../state/issues/selectors';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    bar: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'solid 1px #c0c0c0',
        paddingBottom: 1 / 2,
    },
    avatar: {
        marginLeft: 1,
        borderRadius: '50%',
        width: 32,
        height: 32,
        border: 'solid 1px #000',
    },
    name: {
        marginLeft: 1 / 2,
        fontWeight: 'bold',
        fontSize: 'larger',
    },
    duration: {
        display: 'inline',
        '& span': {
            opacity: 0.5,
        },
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Other extends React.PureComponent {
    render() {
        const {name, avatar, accountId, forbiddenSum} = this.props;
        const {hours, minutes} = forbiddenSum;
        return (
            <>
                <Box sx={SX.bar}>
                    <Box component={'img'} sx={SX.avatar} src={avatar} />
                    <Box sx={SX.name}>
                        {name}
                        {': '}
                        <Box sx={SX.duration}>
                            {hours}
                            <span>h </span>
                            {minutes.toString().padStart(2, '0')}
                            <span>m</span>
                        </Box>
                    </Box>
                </Box>
                <Board accountId={accountId} isEditable={false} />
            </>
        );
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Other.propTypes = exact({
    // --------------------------------- specific:
    accountId: PropTypes.string.isRequired,
    // --------------------------------- redux:
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    forbiddenSum: PropTypes.shape({
        hours: PropTypes.number.isRequired,
        minutes: PropTypes.number.isRequired,
    }).isRequired,
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState, {accountId}) => ({
    name: getAccountName(appState, accountId),
    avatar: getAccountAvatar(appState, accountId),
    forbiddenSum: reselectIssuesDay(appState, accountId).forbiddenSum,
});

export default connect(mapStateToProps)(Other);
