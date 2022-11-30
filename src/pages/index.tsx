import React from 'react';
import {NextPage} from 'next';
import {SiteLink} from 'cordova-sites';
import {MultipleInitialResult, waitForSyncRepository} from "typeorm-sync";
import {User} from "../application/UserManagement/User";
import {useInitialResult} from "typeorm-sync-nextjs";
import {Button, LoadingCircle, Text} from "react-bootstrap-mobile";
import {prepareInitialProps} from "../application/helpers/prepareInitialProps";

export type IndexProps = { initialUsers: MultipleInitialResult<typeof User> };

function Index({initialUsers}: IndexProps) {
    // Variables
    const [users, isLoading, _, reload] = useInitialResult(initialUsers, 10);
    // console.log("LOG-d users", users, error);

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
IndexMemo.getInitialProps = prepareInitialProps(async () => {
    console.log("LOG-d running initialProps");
    const userRepositoryRepository = await waitForSyncRepository(User);
    const users = await userRepositoryRepository.initialFind({relations: ["roles"]});
    return {initialUsers: users};
});

export default IndexMemo;
