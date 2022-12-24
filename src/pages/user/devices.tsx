import React from 'react';
import {NextPage} from "next";

export type devicesProps = {};

function devices({}: devicesProps) {
    // Variables

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects

    // Other

    // Render Functions

    return null;
}

// Need devicesMemo for autocompletion of phpstorm
const devicesMemo = React.memo(devices) as NextPage<devicesProps>;
devicesMemo.getInitialProps = async ({query, res}) => {
    return {}
}

export default devicesMemo
