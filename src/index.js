import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {ThemeProvider} from '@mui/material/styles';
import {CssBaseline} from '@mui/material';

import App from './components/App';
import store from './state/store';
import './state/impex';
import theme from './theme';

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);
