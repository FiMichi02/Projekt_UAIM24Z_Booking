import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext'; // importuj kontekst
import './Toolbar.css';

function Toolbar() {
    const navigate = useNavigate();
    const { isLoggedIn, handleLogout } = useAuth(); // pobieramy isLoggedIn z kontekstu

    function handleNavigate(path) {
        navigate(path);
    }

    function logout() {
        handleLogout()
        alert("Logged out!")
        navigate("/")
    }

    return (
        <div className="toolbar">
            <div className="toolbar-logo">
                <h1>Hotel Booking</h1>
            </div>
            <div className="toolbar-nav">
                <button onClick={() => handleNavigate("/")}>Home</button>
            </div>
            <div className="toolbar-actions">
                {isLoggedIn ? (
                    <>
                        <button onClick={() => handleNavigate("/profile")}>Profile</button>
                        <button onClick={() => logout()}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleNavigate("/login")}>Login</button>
                        <button onClick={() => handleNavigate("/signin")}>Sign Up</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Toolbar;
