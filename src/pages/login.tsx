import React, {useCallback, useState} from 'react';
import {NextPage} from "next";
import {Block, Button, Input, Text} from "react-bootstrap-mobile";
import {LoginResponseData} from "./api/user/login";
import {useUserData} from "../application/UserManagement/useUserData";
import {fetcher} from "../application/fetcher";

export type LoginProps = {};

function Login({}: LoginProps) {
    // Variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const setUser = useUserData(s => s.setUser);
    const setAccesses = useUserData(s => s.setAccesses);
    const user = useUserData(s => s.user);


    // Refs

    // States

    // Selectors

    // Callbacks
    const login = useCallback(async () => {
        const res = await fetcher.post<LoginResponseData>("/api/user/login", {email, password})
        if (res.data.success) {
            setUser(res.data.user);
            setAccesses(res.data.accesses);
        } else {
            console.log("LOG-d error", res);
            setUser(undefined);
        }
    }, [email, password]);

    const testLogin = useCallback(async () => {
        const res = await fetcher.get("/api/test")
        console.log("LOG-d result", res.data);
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
