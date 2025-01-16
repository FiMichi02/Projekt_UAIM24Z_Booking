import LoginForm from './LoginForm'
import React from 'react'
import './Login.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext'; // importuj kontekst

function Login() {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth(); // dostęp do funkcji zmiany stanu logowania

    return (
        <div className={"login-container"}>
            <LoginForm getCreds={
                function (email, password) {
                    const data = {
                        email: email,
                        password: password
                    }

                    axios.post("http://172.20.0.40:5000/api/login", data, { withCredentials: true })
                        .then(response => {
                            console.log('Success:', response.data);
                            alert("Logged in successfully!");
                            setIsLoggedIn(true); // Zaktualizuj stan logowania
                            navigate("/"); // Przekieruj na stronę główną
                        })
                        .catch(error => {
                            alert("Email or Password incorrect!");
                        });
                }
            } />
        </div>
    );
}

export default Login;
