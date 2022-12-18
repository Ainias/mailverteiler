import type { AppProps } from 'next/app';
import * as React from 'react';

import { useCallback, useEffect, useMemo } from 'react';

import Script from 'next/script';
import { StyleProvider } from 'react-bootstrap-mobile';
import { StyleRenderer } from '../application/components/StyleRenderer';
import { Sites } from 'cordova-sites';
import { dom } from '@fortawesome/fontawesome-svg-core';

import '../sass/app.scss';
import setLanguage from 'next-translate/setLanguage';
import { useT } from '../application/hooks/useT';
import { HrefLinks } from '../application/components/HrefLinks';
import {prepareBrowserConnection} from "../application/typeorm/prepareBrowserConnection";

export default function MyApp({ Component, pageProps, router }: AppProps) {
    const currentSite = useMemo(() => ({ Component, pageProps, router }), [Component, pageProps, router]);
    const styles: string[] = useMemo(() => [dom.css()], []);
    const { t, lang } = useT();

    const addStyles = useCallback(
        (...newStyles) => {
            if (typeof document === 'undefined') {
                // eslint-disable-next-line no-underscore-dangle
                styles.push(...newStyles.map((s) => s._getCss()));
            } else {
                // eslint-disable-next-line no-underscore-dangle
                newStyles.forEach((s) => s._insertCss());
            }
        },
        [styles]
    );

    useEffect(() => {
        prepareBrowserConnection().catch(e => console.error(e));
    }, []);

    const defaultTopBarOptions = useMemo(
        () => ({
            rightButtons: [{ title: t('current.language'), action: () => setLanguage(lang === 'en' ? 'de' : 'en') }],
        }),
        [lang, t]
    );

    return (
        <>
            <HrefLinks />
            <Script src="/localforage.js" strategy="beforeInteractive" />
            <StyleProvider value={{ insertCss: addStyles }}>
                <div className="material-design" style={{ width: '100%', height: '100%' }}>
                    {/* <div className="flat-design" style={{ width: '100%', height: '100%' }}> */}
                    <Sites currentSite={currentSite} router={router} defaultTopBarOptions={defaultTopBarOptions} />
                </div>
            </StyleProvider>
            <StyleRenderer styles={styles} />
        </>
    );
}
