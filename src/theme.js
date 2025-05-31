import {createTheme} from '@mui/material/styles';
import MyRobotoRegular400 from '@fontsource/roboto/files/roboto-latin-ext-400-normal.woff';
import MyRobotoItalic400 from '@fontsource/roboto/files/roboto-latin-ext-400-italic.woff';
import MyRobotoRegular700 from '@fontsource/roboto/files/roboto-latin-ext-700-normal.woff';
import MyRobotoItalic700 from '@fontsource/roboto/files/roboto-latin-ext-700-italic.woff';

const theme = createTheme({
    typography: {
        fontFamily: 'MyRoboto, sans-serif',
    },
    palette: {
        text: {
            // Material Design recommends 87% opacity:
            // https://material.io/design/color/text-legibility.html#text-types
            // From their description, it follows that having opacity is good for texts on coloured light backgrounds.
            // However, we always use pure white, so we don't think that reasoning still applies.
            primary: '#000', // MUI default = rgba(0,0,0,0.87)
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                html {
                    cursor: default;
                    user-select: none;
                    font-size: 14px;
                }
                mjx-container[display="true"] {
                    display: inline-block !important;
                    margin: 0 !important;
                }
                @font-face {
                    font-family: 'MyRoboto';
                    font-style: normal;
                    font-display: swap;
                    font-weight: 400;
                    src: url(${MyRobotoRegular400}) format('woff');
                }
                @font-face {
                    font-family: 'MyRoboto';
                    font-style: italic;
                    font-display: swap;
                    font-weight: 400;
                    src: url(${MyRobotoItalic400}) format('woff');
                }
                @font-face {
                    font-family: 'MyRoboto';
                    font-style: normal;
                    font-display: swap;
                    font-weight: 700;
                    src: url(${MyRobotoRegular700}) format('woff');
                }
                @font-face {
                    font-family: 'MyRoboto';
                    font-style: italic;
                    font-display: swap;
                    font-weight: 700;
                    src: url(${MyRobotoItalic700}) format('woff');
                }
            `,
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    width: 24,
                    height: 24,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '1em',
                },
            },
        },
    },
});

export default theme;
