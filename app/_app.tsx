import type {AppProps} from 'next/app'
import Layout from "./components/Layout";
import '../styles/globals.css'
// import {appWithTranslation} from 'next-i18next';
// import theme from '../styles/theme'
// import {ThemeProvider, StyledEngineProvider} from "@mui/material/styles";

function _app({Component, pageProps}: AppProps) {
    return (
        <Layout>
            {/*<StyledEngineProvider injectFirst>*/}
                {/*<ThemeProvider theme={theme}>*/}
                    <Component {...pageProps} />
                {/*</ThemeProvider>*/}
            {/*</StyledEngineProvider>*/}
        </Layout>
    );
}

export default _app; /*appWithTranslation(_app);*/