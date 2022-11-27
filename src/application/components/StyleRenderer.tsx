import * as React from 'react';
import Head from 'next/head';

export type StyleRendererProps = { styles: string[] };

function StyleRenderer({ styles }: StyleRendererProps) {
    // Variables

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects

    // Other

    // Render Functions
    return (
        <Head>
            <style>{styles.join()}</style>
        </Head>
    );
}

// Need StyleRendererMemo for autocompletion of phpstorm
const StyleRendererMemo = React.memo(StyleRenderer) as typeof StyleRenderer;
export { StyleRendererMemo as StyleRenderer };
