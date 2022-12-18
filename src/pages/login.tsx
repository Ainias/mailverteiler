import React, {useCallback, useState} from 'react';
import {NextPage} from "next";
import {Block, Button, Input, Text} from "react-bootstrap-mobile";
import {get, post} from "../application/fetcher";
import {LoginResponseData} from "./api/user/login";
import {useUser} from "../application/UserManagement/useUser";

export type LoginProps = {};

function Login({}: LoginProps) {
    // Variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const setUserData = useUser(s => s.setUserData);
    const user = useUser(s => s.user);


    // Refs

    // States

    // Selectors

    // Callbacks
    const login = useCallback(async () => {
        const res = await post<LoginResponseData>("/api/user/login", {email, password})
        if (res.success) {
            setUserData(res.user);
        } else {
            console.log("LOG-d error", res);
            setUserData(undefined);
        }
    }, [email, password]);

    const testLogin = useCallback(async () => {
        const res = await get("/api/test")
        console.log("LOG-d result", res);
    }, [email, password]);

    // Effects

    // Other

    // Render Functions

    if (user) {
        console.log("LOG-d user", user)
        return <Block>
            <Text>Du bist bereits eingeloggt als {user.username}</Text>
            <Button onClick={testLogin}><Text>Test</Text></Button>
        </Block>
    }

    return <form>
        <Input label="E-Mail" type={"email"} onChangeText={setEmail}/>
        <Input label="Password" type={"password"} onChangeText={setPassword}/>
        <Button onClick={login}><Text>Login</Text></Button>
    </form>
}

// Need LoginMemo for autocompletion of phpstorm
const LoginMemo = React.memo(Login) as NextPage<LoginProps>;
// LoginMemo.getInitialProps = async ({query, res, req}) => {
//     return {}
// }

export default LoginMemo
