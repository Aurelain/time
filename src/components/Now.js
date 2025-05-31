import * as React from 'react';
import {connect} from 'react-redux';
import {Box} from '@mui/material';
import exact from 'prop-types-exact';
import PropTypes from 'prop-types';
import {getTimestamp} from '../state/app/selectors';
import convertTimestampToPercent from '../system/convertTimestampToPercent';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        position: 'absolute',
        top: 0,
        width: '1px',
        height: '100%',
        // background: '#f00',
        background: '#0052cc',
        opacity: 0.8,
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Now extends React.PureComponent {
    interval;

    render() {
        const {timestamp} = this.props;
        const percent = convertTimestampToPercent(timestamp, Date.now());
        if (percent === null) {
            return null;
        }
        return <Box sx={SX.root} style={{left: percent + '%'}} />;
    }

    componentDidMount() {
        this.interval = setInterval(this.onInterval, 1000 * 60);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    onInterval = () => {
        this.forceUpdate();
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Now.propTypes = exact({
    timestamp: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState) => ({
    timestamp: getTimestamp(appState),
});

export default connect(mapStateToProps)(Now);
