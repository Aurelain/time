import * as React from 'react';
import {connect} from 'react-redux';
import {Box, Button, IconButton, Popover, Tooltip, Typography} from '@mui/material';
import AccountMultiple from 'mdi-material-ui/AccountMultiple';
import ChevronLeft from 'mdi-material-ui/ChevronLeft';
import ChevronRight from 'mdi-material-ui/ChevronRight';
import Close from 'mdi-material-ui/Close';

import prettyDate from '../utils/prettyDate';
import prettyWeekday from '../utils/prettyWeekday';
import {getIsOthers, getTimestamp} from '../state/app/selectors';
import {othersToggle, timeTravel} from '../state/app/actions';
import {getAccountId, getImpersonatedEmail, getUserAvatar} from '../state/user/selectors';
import {issuesWorkedFetch} from '../state/issues/actions';
import exact from 'prop-types-exact';
import PropTypes from 'prop-types';
import {reselectIssuesDay} from '../state/issues/selectors';
import {MILLISECONDS_IN_A_DAY} from '../constants';
import earlyMorning from '../utils/earlyMorning';
import {impersonatedEmailChange, userInfoFetch} from '../state/user/actions';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        background: '#0052cc',
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        zIndex: 1,
    },
    rootIsPast: {
        background: '#000',
    },
    left: {
        width: 200,
        display: 'flex',
        justifyContent: 'left',
    },
    right: {
        width: 200,
        display: 'flex',
        justifyContent: 'right',
        marginRight: 1,
    },
    button: {
        height: 64,
        width: 64,
        lineHeight: '64px',
        cursor: 'pointer',
        color: 'white',
        '&:hover': {
            color: 'yellow',
            background: 'rgba(0, 0, 0, 0.1)',
        },
        '&:active': {
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.4)',
            lineHeight: '66px',
        },
    },
    buttonSearch: {
        width: 32,
    },
    grow: {
        flexGrow: 1,
    },
    calendar: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        width: 120,
    },
    weekday: {
        fontWeight: 'bold',
        fontSize: 'larger',
        lineHeight: 0.8,
    },
    date: {
        opacity: 0.8,
        lineHeight: 0.8,
        marginTop: '4px',
    },
    duration: {
        // fontFamily: 'Consolas, sans-serif',
        display: 'inline-block',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: '40px',
        '& span': {
            opacity: 0.5,
        },
    },
    btn: {
        color: '#fff',
        borderRadius: 0,
        '&:hover': {
            color: 'yellow',
        },
        '& .MuiTouchRipple-root': {
            borderRadius: 0,
        },
        '& .MuiTouchRipple-rippleVisible': {
            borderRadius: 0,
            left: '-10px !important',
            top: '-10px !important',
            bottom: '-10px !important',
            right: '-10px !important',
            width: 'auto !important',
            height: 'auto !important',
        },
    },
    avatar: {
        borderRadius: '50%',
        width: 32,
        height: 32,
        border: 'solid 1px #01265e',
    },
    isHidden: {
        visibility: 'hidden',
    },
    isOthers: {
        '& svg': {
            border: 'solid 1px white',
        },
    },
    title: {
        textTransform: 'none',
        color: '#fff',
        fontSize: '24px',
        fontWeight: '500',
    },
};

const TODAY_DATE = prettyDate(Date.now());
const FAST_TRAVEL_INTERVAL = 100;

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Bar extends React.PureComponent {
    state = {
        anchorEl: null,
        fastTravelTimestamp: 0,
    };

    render() {
        const {timestamp, avatar, forbiddenSum, isOthers, impersonatedEmail} = this.props;
        const {anchorEl, fastTravelTimestamp} = this.state;
        const {hours, minutes} = forbiddenSum;
        const displayedTimestamp = fastTravelTimestamp || timestamp;
        const currentDate = prettyDate(displayedTimestamp);
        const isPast = currentDate !== TODAY_DATE;
        return (
            <Box sx={[SX.root, isPast && SX.rootIsPast]}>
                <Box sx={SX.left}>
                    <Tooltip title={isOthers ? 'Click to see only your own tasks.' : 'Click to also see other users.'}>
                        <IconButton
                            sx={[SX.btn, isOthers && SX.isOthers]}
                            onClick={this.onOthersClick}
                            style={{display: 'none'}} // TODO: enable this based on ?all
                        >
                            <AccountMultiple />
                        </IconButton>
                    </Tooltip>
                    <Button sx={SX.title} onClick={this.onTitleClick}>
                        Time
                    </Button>
                </Box>

                <Box sx={SX.grow} />

                <IconButton sx={SX.btn} onClick={this.onPrevNextClick} onPointerDown={this.onPrevDown}>
                    <ChevronLeft />
                </IconButton>

                <Box sx={SX.calendar} onClick={this.onCalendarClick}>
                    <Box sx={SX.weekday}>{prettyWeekday(displayedTimestamp)}</Box>
                    <Box sx={SX.date}>{currentDate}</Box>
                </Box>

                <IconButton sx={SX.btn} onClick={this.onPrevNextClick} onPointerDown={this.onNextDown}>
                    <ChevronRight />
                </IconButton>

                <Box sx={SX.grow} />

                <Box sx={SX.right}>
                    <Box sx={SX.duration}>
                        {hours}
                        <span>h </span>
                        {minutes.toString().padStart(2, '0')}
                        <span>m</span>
                    </Box>
                    <IconButton sx={SX.btn} onClick={this.onAccountClick}>
                        <Box component={'img'} sx={SX.avatar} src={avatar} />
                    </IconButton>
                    <Popover
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={this.onAccountClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{
                            marginTop: '2px',
                            marginLeft: '12px',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <Typography sx={{p: 2}} onClick={this.onEmailClick}>
                            {impersonatedEmail || localStorage.getItem('email')}
                        </Typography>
                        {impersonatedEmail && (
                            <IconButton onClick={this.onEndImpersonationClick}>
                                <Close />
                            </IconButton>
                        )}
                        <Button
                            color="primary"
                            onClick={this.onLogoutClick}
                            sx={{display: 'block', minWidth: 'auto', width: '100%'}}
                        >
                            Logout
                        </Button>
                    </Popover>
                </Box>
            </Box>
        );
    }

    onCalendarClick = () => {
        const {dispatch, timestamp} = this.props;
        const response = prompt('Day:', prettyDate(timestamp));
        if (response === null) {
            return;
        }
        if (response === '') {
            dispatch(timeTravel(earlyMorning(Date.now())));
        } else {
            try {
                dispatch(timeTravel(earlyMorning(new Date(response))));
                dispatch(issuesWorkedFetch());
            } catch (e) {}
        }
    };

    onPrevNextClick = () => {
        const {dispatch, timestamp} = this.props;
        const {fastTravelTimestamp} = this.state;
        dispatch(timeTravel(fastTravelTimestamp || timestamp + this.fastTravelSign * MILLISECONDS_IN_A_DAY));
        dispatch(issuesWorkedFetch());
    };

    onPrevDown = () => {
        this.fastTravelSign = -1;
        this.fastTravelTicker = -5;
        this.fastTravelInterval = setInterval(this.onFastTravelInterval, FAST_TRAVEL_INTERVAL);
        window.addEventListener('pointerup', this.onWindowPointerUp);
    };

    onNextDown = () => {
        this.fastTravelSign = 1;
        this.fastTravelTicker = -5;
        this.fastTravelInterval = setInterval(this.onFastTravelInterval, FAST_TRAVEL_INTERVAL);
        window.addEventListener('pointerup', this.onWindowPointerUp);
    };

    onFastTravelInterval = () => {
        this.fastTravelTicker++;
        if (this.fastTravelTicker < 0) {
            return;
        }
        const {timestamp} = this.props;
        this.setState({
            fastTravelTimestamp: timestamp + this.fastTravelTicker * MILLISECONDS_IN_A_DAY * this.fastTravelSign,
        });
    };

    onWindowPointerUp = () => {
        clearInterval(this.fastTravelInterval);
        this.fastTravelInterval = setTimeout(() => {
            this.setState({
                fastTravelTimestamp: 0,
            });
        }, 100);
    };

    onAccountClick = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    onAccountClose = () => {
        this.setState({anchorEl: null});
    };

    onLogoutClick = () => {
        localStorage.clear();
        window.location.reload();
    };

    onOthersClick = () => {
        const {dispatch} = this.props;
        dispatch(othersToggle());
    };

    onTitleClick = () => {
        window.location.href = '#';
    };

    onEmailClick = () => {
        const impersonatedEmail = window.prompt('Which email do you want to impersonate?');
        if (impersonatedEmail) {
            const {dispatch} = this.props;
            dispatch(impersonatedEmailChange(impersonatedEmail));
            dispatch(userInfoFetch());
            this.setState({anchorEl: null});
        }
    };

    onEndImpersonationClick = () => {
        const {dispatch} = this.props;
        dispatch(impersonatedEmailChange(''));
        dispatch(userInfoFetch());
        this.setState({anchorEl: null});
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Bar.propTypes = exact({
    // --------------------------------- redux:
    timestamp: PropTypes.number.isRequired,
    impersonatedEmail: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    isOthers: PropTypes.bool.isRequired,
    forbiddenSum: PropTypes.shape({
        hours: PropTypes.number.isRequired,
        minutes: PropTypes.number.isRequired,
    }).isRequired,
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState) => ({
    timestamp: getTimestamp(appState),
    avatar: getUserAvatar(appState),
    isOthers: getIsOthers(appState),
    forbiddenSum: reselectIssuesDay(appState, getAccountId(appState)).forbiddenSum,
    impersonatedEmail: getImpersonatedEmail(appState),
});

export default connect(mapStateToProps)(Bar);
