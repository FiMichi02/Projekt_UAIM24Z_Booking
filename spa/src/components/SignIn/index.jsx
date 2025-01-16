import SignInForm from './SignInForm'
import React from 'react'
import './SignIn.css'
import axios from "axios";

function SignIn() {

    return(
        <div className={"sign-in-container"}>
            <h1>Sign In page</h1>
            <SignInForm getData={
                function (email, password, firstName, secondName) {
                    const data = {
                        email: email,
                        password: password,
                        firstName: firstName,
                        secondName: secondName
                    }

                    axios.post("http://172.20.0.40:5000/api/register-user", data)
                        .then(response => {
                            console.log('Success:', response.data);
                            alert("Udało się zarejestrować")
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });

                }
            }/>
        </div>
    )
}

export default SignIn;