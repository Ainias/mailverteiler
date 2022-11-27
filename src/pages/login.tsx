import React, {useCallback, useState} from 'react';
import {NextPage} from "next";
import {Block, Button, Input, Text} from "react-bootstrap-mobile";
import {post} from "../application/fetcher";

export type LoginProps = {};

function Login({}: LoginProps) {
    // Variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Refs

    // States

    // Selectors

    // Callbacks
    const login = useCallback(async () => {
        const res = await post("/api/user/login", {email, password})
        console.log("LOG-d  username, password", res);
    }, [email, password]);

    // Effects

    // Other

    // Render Functions

    return<form>
            <Input label="E-Mail" type={"email"} onChangeText={setEmail}/>
            <Input label="Password" type={"password"} onChangeText={setPassword}/>
            <Button onClick={login}><Text>Login</Text></Button>
        </form>
}

// Need LoginMemo for autocompletion of phpstorm
const LoginMemo = React.memo(Login) as NextPage<LoginProps>;
LoginMemo.getInitialProps = async ({query, res}) => {
    return {}
}

export default LoginMemo
