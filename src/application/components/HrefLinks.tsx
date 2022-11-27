import * as React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export type ShowSiteStackProps = Record<string, never>;

function HrefLinks(_: ShowSiteStackProps) {
    // Variables
    const router = useRouter();

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects

    // Other

    // Render Functions

    return (
        <Head>
            {router.locales.map((locale) => {
                const url =
                    process.env.NEXT_PUBLIC_HOST +
                    router.basePath +
                    (locale === router.defaultLocale ? '' : `/${locale}`) +
                    router.asPath;
                return <link key={locale} rel="alternate" hrefLang={locale} href={url} />;
            })}
        </Head>
    );
}

// Need HrefLinksMemo for autocompletion of phpstorm
const HrefLinksMemo = React.memo(HrefLinks);
export { HrefLinksMemo as HrefLinks };
