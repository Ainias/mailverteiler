import React from 'react';
import {NextPage} from "next";
import {ModifyListForm} from "../../application/components/lists/ModifyListForm";
import {prepareInitialProps} from "../../application/helpers/prepare/prepareInitialProps";
import {RIGHTS} from "../../application/Rights";


export type createListProps = {};

function createList({}: createListProps) {
    // Variables

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects

    // Other

    // Render Functions

    return <ModifyListForm/>;
}

// Need createListMemo for autocompletion of phpstorm
const createListMemo = React.memo(createList) as NextPage<createListProps>;
createListMemo.getInitialProps = prepareInitialProps(async ({query, res}) => {
    return {};
}, RIGHTS.EDIT_LIST);

export default createListMemo;
