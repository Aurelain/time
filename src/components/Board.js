import * as React from 'react';
import {Box, Checkbox, FormControlLabel} from '@mui/material';
import Grid from './Grid';
import {ISSUE_HEAD_WIDTH} from '../constants';
import Now from './Now';
import exact from 'prop-types-exact';
import PropTypes from 'prop-types';
import {getTimestamp} from '../state/app/selectors';
import {connect} from 'react-redux';
import {getIssuesRepository, reselectIssuesDay} from '../state/issues/selectors';
import Issue from './Issue';
import convertPercentToTimestamp from '../system/convertPercentToTimestamp';
import prettyTime from '../utils/prettyTime';
import imprison from '../utils/imprison';
import convertEventToPercent from '../system/convertEventToPercent';
import prettyDuration from '../utils/prettyDuration';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        marginBottom: 6,
    },
    content: {
        position: 'relative',
    },
    gridWrapper: {
        position: 'absolute',
        top: 0,
        left: ISSUE_HEAD_WIDTH,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
    },
    nowHost: {
        position: 'absolute',
        top: 0,
        left: ISSUE_HEAD_WIDTH,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    info: {
        position: 'fixed',
        minWidth: '200px',
        maxWidth: '400px',
        zIndex: 1,
        pointerEvents: 'none',
    },
    infoContent: {
        background: 'rgba(0,0,0,.7)',
        padding: 1,
        color: '#fff',
        borderRadius: 1,
    },
    code: {
        fontWeight: 'bold',
        color: '#999',
    },
    total: {
        float: 'right',
        color: '#999',
    },
    time: {
        color: '#ff0',
    },
    forbidden: {
        position: 'absolute',
        background: 'rgba(0,0,0,.05)',
        height: '100%',
    },
    footer: {
        fontStyle: 'italic',
        padding: '4px',
    },
    control: {
        marginLeft: 1,
    },
    checkbox: {
        paddingRight: 0,
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Board extends React.PureComponent {
    state = {
        isDragging: false,
        hasInfo: false,
        code: '',
        summary: '',
        left: 0,
        top: 0,
        time: '',
        show: {
            normal: window.localStorage.normal !== '0',
            frozen: window.localStorage.frozen !== '0',
            watched: window.localStorage.watched !== '0',
            others: window.localStorage.others !== '0',
        },
    };
    infoRef = React.createRef();

    render() {
        const {day, isEditable, accountId} = this.props;
        const {visibleIssues, forbiddenIntervals, totals, groups} = day;
        const {hasInfo, code, summary, left, top, time, show} = this.state;
        return (
            <Box sx={SX.root}>
                <Box
                    sx={SX.content}
                    onPointerMove={this.onContentPointerMove}
                    onPointerLeave={this.onContentPointerLeave}
                >
                    {visibleIssues.map(({code, intervals}) => {
                        for (const key in show) {
                            if (!show[key] && code in groups[key]) {
                                return null;
                            }
                        }
                        return (
                            <Issue
                                key={code}
                                code={code}
                                accountId={accountId}
                                isEditable={isEditable}
                                intervals={intervals}
                                forbiddenIntervals={forbiddenIntervals}
                                onDragStart={this.onDragStart}
                                onDragEnd={this.onDragEnd}
                            />
                        );
                    })}
                    <Box sx={SX.gridWrapper}>
                        <Grid />
                        {forbiddenIntervals.map(({left, right}, index) => (
                            <Box key={index} sx={SX.forbidden} style={{left, right}} />
                        ))}
                    </Box>
                    <Box sx={SX.nowHost}>
                        <Now />
                    </Box>
                </Box>
                <Box sx={SX.footer}>
                    {visibleIssues.length} issues:
                    {Object.keys(groups).map((groupName) => (
                        <FormControlLabel
                            key={groupName}
                            sx={SX.control}
                            control={
                                <Checkbox
                                    sx={SX.checkbox}
                                    checked={show[groupName]}
                                    onChange={this.onCheckboxChange}
                                    data-name={groupName}
                                />
                            }
                            label={Object.keys(groups[groupName]).length + ' ' + groupName}
                        />
                    ))}
                </Box>

                {hasInfo && (
                    <Box ref={this.infoRef} sx={SX.info} style={{left, top}}>
                        <Box sx={SX.infoContent}>
                            <Box sx={SX.total}>{prettyDuration(totals[code])}</Box>
                            <Box sx={SX.code}>{code}</Box>
                            <Box sx={SX.summary}>{summary}</Box>
                            {time && <Box sx={SX.time}>{time}</Box>}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.hasInfo) {
            const info = this.infoRef.current;
            const bounds = info.getBoundingClientRect();
            const width = document.body.offsetWidth;
            if (bounds.right > width) {
                info.firstChild.style.transform = `translateX(${width - bounds.right}px)`;
            } else {
                info.firstChild.style.removeProperty('transform');
            }
        }
    }

    onContentPointerMove = (event) => {
        if (this.state.draggingElement) {
            return;
        }
        if (this.state.hasInfo) {
            return;
        }
        window.addEventListener('pointermove', this.onWindowPointerMove);
        this.setState({hasInfo: true});
        this.updateInfo(event);
    };

    onWindowPointerMove = (event) => {
        this.updateInfo(event);
    };

    onContentPointerLeave = () => {
        if (this.state.draggingElement) {
            return;
        }
        this.hideInfo();
    };

    updateInfo = (event) => {
        const {clientX, target} = event;
        const {repository, timestamp} = this.props;
        const {draggingElement} = this.state;
        const issueElement = draggingElement || target.closest('[data-code]');
        if (!issueElement) {
            return;
        }
        const {code} = issueElement.dataset;
        const x = draggingElement ? imprison(clientX, ISSUE_HEAD_WIDTH, document.body.offsetWidth) : clientX;

        let time;
        if (x >= ISSUE_HEAD_WIDTH) {
            const percent = convertEventToPercent(event);
            const pointerTimestamp = convertPercentToTimestamp(timestamp, percent);
            const pointerDate = new Date(pointerTimestamp);
            time = prettyTime(pointerDate);
        }

        this.setState({
            code,
            summary: repository[code].summary,
            left: x,
            top: issueElement.getBoundingClientRect().bottom,
            time,
        });
    };

    hideInfo = () => {
        window.removeEventListener('pointermove', this.onWindowPointerMove);
        this.setState({hasInfo: false});
    };

    onDragStart = (draggingElement) => {
        this.setState({
            draggingElement,
        });
    };

    onDragEnd = () => {
        this.hideInfo();
        this.setState({
            draggingElement: null,
        });
    };

    onCheckboxChange = (event, value) => {
        const {name} = event.target.parentNode.dataset;
        window.localStorage[name] = value ? '1' : '0';
        this.setState({
            show: {
                ...this.state.show,
                [name]: value,
            },
        });
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Board.propTypes = exact({
    // --------------------------------- specific:
    accountId: PropTypes.string.isRequired,
    isEditable: PropTypes.bool.isRequired,
    // --------------------------------- redux:
    timestamp: PropTypes.number.isRequired,
    day: PropTypes.shape({
        visibleIssues: PropTypes.arrayOf(
            PropTypes.shape({
                code: PropTypes.string.isRequired,
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
            })
        ).isRequired,
        forbiddenIntervals: PropTypes.arrayOf(
            PropTypes.shape({
                begin: PropTypes.number.isRequired,
                end: PropTypes.number.isRequired,
                left: PropTypes.string.isRequired,
                right: PropTypes.string.isRequired,
            })
        ).isRequired,
        totals: PropTypes.objectOf(PropTypes.number).isRequired,
        groups: PropTypes.shape({
            watched: PropTypes.objectOf(PropTypes.bool).isRequired,
            others: PropTypes.objectOf(PropTypes.bool).isRequired,
            frozen: PropTypes.objectOf(PropTypes.bool).isRequired,
            normal: PropTypes.objectOf(PropTypes.bool).isRequired,
        }),
    }),
    repository: PropTypes.objectOf(
        PropTypes.shape(
            exact({
                code: PropTypes.string.isRequired,
                summary: PropTypes.string.isRequired,
                priority: PropTypes.string.isRequired,
                iconUrl: PropTypes.string.isRequired,
                assignee: PropTypes.string,
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
                watchers: PropTypes.objectOf(PropTypes.bool).isRequired,
                searches: PropTypes.object,
            })
        )
    ).isRequired,
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState, {accountId}) => ({
    timestamp: getTimestamp(appState),
    day: reselectIssuesDay(appState, accountId),
    repository: getIssuesRepository(appState),
});

export default connect(mapStateToProps)(Board);
