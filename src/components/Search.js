import * as React from 'react';
import {ISSUE_HEAD_WIDTH} from '../constants';
import {Box, IconButton} from '@mui/material';
import {getSearch} from '../state/app/selectors';
import {connect} from 'react-redux';
import {SEARCH_DEFAULT} from '../system/CONSTANTS';
import memoize from 'memoize-one';
import exact from 'prop-types-exact';
import PropTypes from 'prop-types';
import {searchChange} from '../state/app/actions';
import Check from 'mdi-material-ui/Check';
import Magnify from 'mdi-material-ui/Magnify';
import {issuesAvailableFetch} from '../state/issues/actions';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        marginTop: '40px',
        zIndex: 2,
        position: 'absolute',
        left: 0,
        top: 0,
        width: ISSUE_HEAD_WIDTH + 'px',
        height: 23,
    },
    isPending: {
        background: '#fff9c4',
    },
    input: {
        position: 'absolute',
        border: 'none',
        width: ISSUE_HEAD_WIDTH - 24 + 'px',
        height: '100%',
        background: 'none',
        outline: 'none',
        fontFamily: 'MyRoboto, sans-serif',
        fontSize: '14px',
    },
    submit: {
        position: 'absolute',
        right: 0,
        top: 0,
        borderRadius: 0,
        padding: 0,
        color: 'rgba(0, 0, 0, 0.54)',
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Search extends React.PureComponent {
    state = {
        localSearch: null,
    };

    render() {
        const {localSearch} = this.state;
        const {reduxSearch} = this.props;
        const isPending = localSearch !== null && localSearch !== reduxSearch;
        const search = this.memoSearch(isPending, localSearch, reduxSearch);
        return (
            <Box sx={[SX.root, isPending && SX.isPending]}>
                <Box
                    component={'input'}
                    sx={SX.input}
                    value={search}
                    onChange={this.onInputChange}
                    onKeyDown={this.onInputKeyDown}
                    onPointerUp={this.onPointerUp}
                    placeholder={'(Relevant issues)'}
                    spellCheck="false"
                    autoComplete="off"
                />
                {isPending && (
                    <IconButton sx={SX.submit} onClick={this.onSubmitClick}>
                        <Check />
                    </IconButton>
                )}
                {!isPending && <Magnify sx={SX.submit} />}
            </Box>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reduxSearch !== this.props.reduxSearch) {
            this.setState({
                localSearch: null,
            });
        }
    }

    memoSearch = memoize((isPending, localSearch, reduxSearch) => {
        let search = isPending ? localSearch : reduxSearch;
        search = search === SEARCH_DEFAULT ? '' : search;
        return search;
    });

    onInputChange = (event) => {
        this.setState({
            localSearch: event.target.value || SEARCH_DEFAULT,
        });
    };

    onInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            const {reduxSearch} = this.props;
            const {localSearch} = this.state;
            const isPending = localSearch !== null && localSearch !== reduxSearch;
            if (isPending) {
                this.announceChange();
            }
        }
    };

    onSubmitClick = () => {
        this.announceChange();
    };

    announceChange = () => {
        const {dispatch} = this.props;
        const {localSearch} = this.state;
        dispatch(searchChange(localSearch));
        dispatch(issuesAvailableFetch());
    };

    onPointerUp = (event) => {
        if (event.button === 1) {
            // Middle-click
            alert('middle-click');
        }
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
Search.propTypes = exact({
    // --------------------------------- redux:
    reduxSearch: PropTypes.string.isRequired,
    // --------------------------------- wrapper:
    dispatch: PropTypes.func.isRequired,
});

const mapStateToProps = (appState) => ({
    reduxSearch: getSearch(appState),
});

export default connect(mapStateToProps)(Search);
