import React, {useCallback} from 'react';
import {NextPage} from "next";
import {prepareInitialProps} from "../application/helpers/prepare/prepareInitialProps";
import {useUser} from "../application/UserManagement/useUser";
import {Button, Text} from "react-bootstrap-mobile";
import {fetcher} from "../application/fetcher";
import {TestMailmanData} from "./api/testMailman";

export type testProps = {};

function TestMailman({}: testProps) {
    // Variables

    const user = useUser();
    console.log("LOG-d user", user);


    // Refs

    // States

    // Selectors

    // Callbacks
    const callApi = useCallback(async (_, action: string, args?: any) => {
        const res = await fetcher.post<TestMailmanData>("/api/testMailman", {action, args});
        console.log("LOG-d result for ", action, res.data.result);
    }, []);

    const createDomain = useCallback(async () => {
        await callApi(undefined, "setDomain", ["test.org"]);
    }, []);

    const getLists = useCallback(async () => {
        const res = await fetcher.get("/api/mail/lists" );
        console.log("LOG-d result for ", res.data.result);
    }, []);

    // Effects

    // Other

    // Render Functions

    return <>
        <Button onClick={callApi} onClickData="versions"><Text>Version</Text></Button>
        <Button onClick={callApi} onClickData="getDomains"><Text>Domains</Text></Button>
        <Button onClick={createDomain}><Text>Create Domains</Text></Button>
        <Button onClick={getLists}><Text>Get Lists</Text></Button>
    </>;
}

// Need testMemo for autocompletion of phpstorm
const testMemo = React.memo(TestMailman) as NextPage<testProps>;
testMemo.getInitialProps = prepareInitialProps(() => {
}, "admin");

export default testMemo;
