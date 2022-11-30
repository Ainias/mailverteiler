import React, {useEffect} from 'react';
import {withMemo} from 'react-bootstrap-mobile';
import {useUser} from "./useUser";
import {updateDefaultHeaders} from "../fetcher";


export type UserTokenHandlerProps = {};

function UserTokenHandler({}: UserTokenHandlerProps) {
    // Variables
    const token = useUser(s => s.token);

    // Refs

    // States

    // Selectors

    // Callbacks

    // Effects
    useEffect(() => {
        updateDefaultHeaders({"Authorisation": token ? "Bearer "+token: ""})
    }, [token])

    // Other

    // Render Functions

    return null;
}

// Need UserTokenHandlerMemo for autocompletion of phpstorm
const UserTokenHandlerMemo = withMemo(UserTokenHandler);
export {UserTokenHandlerMemo as UserTokenHandler}
