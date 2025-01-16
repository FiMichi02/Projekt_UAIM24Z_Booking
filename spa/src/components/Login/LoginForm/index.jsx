
import useInput from "../../hooks/useInput";
import React from "react";


function LoginForm({getCreds = f => f}) {

    const [email, resetEmail] = useInput("");
    const [password, resetPassword] = useInput("");

    function submit(e) {
        e.preventDefault();

        getCreds(email.value, password.value);
        resetEmail();
        resetPassword()
    }

    return (
        <>
            <h1>Login page</h1>
            <form onSubmit={submit}>
                <input {...email} type={"text"} placeholder={"Email"} required/>
                <input {...password} type={"password"} placeholder={"Password"} required/>
                <button type={"submit"}>Log In</button>
            </form>
        </>
    )
}

export default LoginForm