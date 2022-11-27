import React, {useEffect} from 'react';
import { NextPage } from 'next';
import { SiteLink } from 'cordova-sites';
import {prepareConnection} from "../application/typeorm/prepareConnection";
import {MultipleInitialResult, waitForSyncRepository} from "typeorm-sync";
import {User} from "../models/User";
import {useFind, useInitialResult} from "typeorm-sync-nextjs";
import {Button, LoadingCircle, Text} from "react-bootstrap-mobile";

export type IndexProps = {initialUsers: MultipleInitialResult<typeof User>};

function Index({initialUsers}: IndexProps) {
    // Variables
    const [users, isLoading, error, reload] = useInitialResult(initialUsers, 10);
    console.log("LOG-d users", users);

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects

    // Other

    // Render Functions

    return <>
        <Button onClick={reload}><Text>Reload</Text></Button>
        {users.map(user => <div key={user.id}>{user.username}</div>)}
        <div>{!!isLoading && <LoadingCircle/>}</div>
        <SiteLink href={"login"}>Go to login</SiteLink>
        </>;
}

// Need IndexMemo for autocompletion of phpstorm
const IndexMemo = React.memo(Index) as NextPage<IndexProps>;
IndexMemo.getInitialProps = async ({ query, res }) => {
    await prepareConnection();
    const questionRepository = await waitForSyncRepository(User);
    const users = await questionRepository.initialFind({relations: ["roles"]});
    return { initialUsers: users };
};

export default IndexMemo;
