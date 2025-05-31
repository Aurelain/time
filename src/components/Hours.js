import * as React from 'react';
import Grid from './Grid';
import {ISSUE_HEAD_WIDTH} from '../constants';
import {Box} from '@mui/material';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SX = {
    root: {
        marginTop: '40px',
        position: 'relative',
        height: 24,
        borderBottom: 'solid 1px #c0c0c0',
        lineHeight: '24px',
        overflow: 'hidden',
    },
    core: {
        marginLeft: ISSUE_HEAD_WIDTH + 'px',
        background: '#9fbbff',
        position: 'relative',
        height: '100%',
    },
};

// =====================================================================================================================
//  C O M P O N E N T
// =====================================================================================================================
class Hours extends React.PureComponent {
    render() {
        return (
            <Box sx={SX.root}>
                <Box sx={SX.core}>
                    <Grid hasNumbers={true} />
                </Box>
            </Box>
        );
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
// interface Props {
//     classes: Classes<typeof styles>;
// }

export default Hours;
