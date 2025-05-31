import React from 'react';
import {connect} from 'react-redux';
import exact from 'prop-types-exact';
import {Box} from '@mui/material';
import PropTypes from 'prop-types';
import {getIssueIconUrl, getIssueSummary, getIssueWatchers, getIssueWorklogs} from '../state/issues/selectors';
import {ISSUE_HEAD_WIDTH, JIRA_URL} from '../constants';
import memo from '../utils/memo';
import convertEventToPercent from '../system/convertEventToPercent';
import convertPercentToTimestamp from '../system/convertPercentToTimestamp';
import {getTimestamp} from '../state/app/selectors';
import {
    issueSelectionChange,
    issueSelectionFinish,
    issueSelectionRevert,
    issueSelectionStart,
} from '../state/issues/actions';
import EyeOutline from 'mdi-material-ui/EyeOutline';
import copyToClipboard from 'copy-to-clipboard';
import {infoMessageShow} from '../state/app/actions';
import isEmpty from '../utils/isEmpty';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        borderBottom: 'solid 1px #c0c0c0',
        display: 'flex',
        lineHeight: '24px',
        '&:hover': {background: 'rgba(255,255,0,.2)'},
    },
    rootIsEditable: {
        cursor: 'text',
    },
    rootHasSelection: {
        background: 'rgba(0,0,255,.1)',
    },
    head: {
        display: 'flex',
        width: ISSUE_HEAD_WIDTH,
        color: '#000',
        textDecoration: 'none',
        alignItems: 'center',
        // borderRight: 'solid 1px #c0c0c0',
    },
    headUnavailable: {
        background: 'silver',
    },
    icon: {
        marginLeft: '2px',
        marginRight: '2px',
        width: '16px',
        height: '16px',
        verticalAlign: 'middle',
        flexShrink: 0,
    },
    code: {
        width: 72,
        fontWeight: 'bold',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    summary: {
        flexGrow: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    day: {
        flexGrow: 1,
        position: 'relative',
    },
    fill: {
        position: 'absolute',
        height: '100%',
        background: '#ffa500',
    },
    selection: {
        position: 'absolute',
        height: '100%',
        border: 'solid 1px #f00',
    },
    isAddition: {
        border: 'solid 1px #663200',
    },
    eyeMine: {
        margin: '0 2px',
    },
    eyeOthers: {
        margin: '0 2px',
        color: 'red',
    },
};
const URL = JIRA_URL + '/browse/';

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Issue extends React.PureComponent {
    state = {
        activeLeft: '',
        activeWidth: '',
    };
    initialPercent;
    isAddition;
    initialTimestamp;
    initialWorklogs;
    initialForbidden;
    rootRef = React.createRef();
    memoRoot = memo();
    memoHead = memo();

    render() {
        const {code, intervals, summary, iconUrl, accountId, watchers, isEditable} = this.props;
        const isWatchedByTargetedAccount = accountId in watchers;
        const isAvailableAndWatchedByOthers = !(accountId in watchers) && !isEmpty(watchers);

        const {selectionLeft, selectionWidth} = this.state;
        return (
            <Box
                ref={this.rootRef}
                sx={this.memoRoot(SX.root, selectionLeft && SX.rootHasSelection, isEditable && SX.rootIsEditable)}
                data-code={code}
            >
                <Box sx={this.memoHead(SX.head)} component={'a'} target="_blank" rel="noreferrer" href={URL + code}>
                    <Box sx={SX.icon} component={'img'} src={iconUrl} onClick={this.onIconClick} />
                    <Box sx={SX.code} onClick={this.onIconClick}>
                        {code}
                    </Box>
                    <Box sx={SX.summary}>{summary}</Box>
                    {(isWatchedByTargetedAccount || isAvailableAndWatchedByOthers) && <EyeOutline sx={SX.eyeMine} />}
                </Box>
                <Box sx={SX.day} onPointerDown={isEditable ? this.onPointerDown : null}>
                    {intervals.map(({left, right}, index) => (
                        <Box
                            key={index}
                            sx={SX.fill}
                            style={{
                                left,
                                right,
                            }}
                        />
                    ))}

                    {selectionLeft && (
                        <Box
                            sx={[SX.selection, this.isAddition && SX.isAddition]}
                            style={{left: selectionLeft, width: selectionWidth}}
                        />
                    )}
                </Box>
            </Box>
        );
    }

    /**
     *
     */
    onPointerDown = (event) => {
        this.initialPercent = convertEventToPercent(event);

        document.body.style.pointerEvents = 'none';
        document.body.style.cursor = 'text';
        window.addEventListener('pointerup', this.onWindowPointerUp);
        window.addEventListener('pointermove', this.onWindowPointerMove);
        window.addEventListener('keydown', this.onWindowKeyDown);

        const {code, morning, worklogs, forbiddenIntervals, onDragStart, dispatch} = this.props;
        const cursorPercent = convertEventToPercent(event);
        this.initialTimestamp = convertPercentToTimestamp(morning, cursorPercent);
        this.initialWorklogs = worklogs;
        this.initialForbidden = forbiddenIntervals;
        this.isAddition = event.button === 0;

        onDragStart(this.rootRef.current);
        dispatch(issueSelectionStart(code));
    };

    /**
     *
     */
    onWindowPointerMove = (event) => {
        const {morning, code, dispatch} = this.props;

        const cursorPercent = convertEventToPercent(event);
        const width = Math.abs(cursorPercent - this.initialPercent);
        this.setState({
            selectionLeft: Math.min(this.initialPercent, cursorPercent) + '%',
            selectionWidth: width + '%',
        });

        const value = convertPercentToTimestamp(morning, cursorPercent);
        const begin = Math.min(value, this.initialTimestamp);
        const end = Math.max(value, this.initialTimestamp);

        dispatch(issueSelectionChange(code, this.initialWorklogs, this.initialForbidden, this.isAddition, begin, end));
    };

    /**
     *
     */
    onWindowKeyDown = (event) => {
        if (event.key === 'Escape') {
            const {dispatch, code} = this.props;
            dispatch(issueSelectionRevert(code, this.initialWorklogs));
            this.stopDrag();
        }
    };

    /**
     *
     */
    onWindowPointerUp = () => {
        const {dispatch, code, worklogs} = this.props;
        this.stopDrag();
        dispatch(issueSelectionFinish(code, this.initialWorklogs, worklogs));
    };

    /**
     *
     */
    stopDrag = () => {
        document.body.style.removeProperty('pointer-events');
        document.body.style.removeProperty('cursor');
        window.removeEventListener('pointerup', this.onWindowPointerUp);
        window.removeEventListener('pointermove', this.onWindowPointerMove);
        window.removeEventListener('keydown', this.onWindowKeyDown);
        this.setState({selectionLeft: null});

        this.props.onDragEnd();
    };

    /**
     *
     */
    onIconClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const {code, summary, dispatch} = this.props;
        copyToClipboard(code + ' ' + summary.trim());
        dispatch(infoMessageShow('Copied to clipboard.'));
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Issue.propTypes = exact({
    // --------------------------------- direct:
    code: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
    intervals: PropTypes.arrayOf(
        PropTypes.shape(
            exact({
                begin: PropTypes.number.isRequired,
                end: PropTypes.number.isRequired,
                left: PropTypes.string.isRequired,
                right: PropTypes.string.isRequired,
            })
        )
    ),
    forbiddenIntervals: PropTypes.arrayOf(
        PropTypes.shape(
            exact({
                begin: PropTypes.number.isRequired,
                end: PropTypes.number.isRequired,
                left: PropTypes.string.isRequired,
                right: PropTypes.string.isRequired,
            })
        )
    ).isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    isEditable: PropTypes.bool.isRequired,
    // --------------------------------- redux:
    morning: PropTypes.number.isRequired,
    watchers: PropTypes.objectOf(PropTypes.bool).isRequired,
    summary: PropTypes.string.isRequired,
    iconUrl: PropTypes.string.isRequired,
    worklogs: PropTypes.objectOf(
        PropTypes.shape(
            exact({
                worklogId: PropTypes.string.isRequired,
                accountId: PropTypes.string.isRequired,
                begin: PropTypes.number.isRequired,
                end: PropTypes.number.isRequired,
            })
        )
    ),
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState, {code}) => ({
    morning: getTimestamp(appState),
    watchers: getIssueWatchers(appState, code),
    summary: getIssueSummary(appState, code),
    iconUrl: getIssueIconUrl(appState, code),
    worklogs: getIssueWorklogs(appState, code),
});

export default connect(mapStateToProps)(Issue);
