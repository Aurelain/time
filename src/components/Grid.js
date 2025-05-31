import * as React from 'react';
import {Box} from '@mui/material';
import csx from '../utils/csx';
import PERCENTS from '../system/PERCENTS';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    column: {
        paddingLeft: '1px',
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderLeft: 'solid 1px #eee',
        '&:first-of-type': {
            borderLeft: 'solid 1px #c0c0c0',
        },
    },
    columnHasNumbers: {
        borderLeft: 'solid 1px #0052cc !important',
        fontSize: '11px',
        // fontSize: '0.8vw',
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Grid extends React.PureComponent {
    render() {
        const {hasNumbers} = this.props;
        let currentLeft = 0;
        return (
            <Box sx={SX.root}>
                {PERCENTS.map((percent, index) => {
                    const initialLeft = currentLeft;
                    currentLeft += percent;
                    return (
                        <Box
                            key={index}
                            sx={csx(SX.column, hasNumbers && SX.columnHasNumbers)}
                            style={{
                                left: initialLeft + '%',
                                width: percent + '%',
                            }}
                        >
                            {hasNumbers && index}
                        </Box>
                    );
                })}
            </Box>
        );
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
// interface Props {
//     hasNumbers?: boolean;
//     classes: Classes<typeof styles>;
// }

export default Grid;
