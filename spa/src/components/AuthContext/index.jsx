import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Tworzymy kontekst
const AuthContext = createContext();

// Hook, który będzie dostarczać dostęp do kontekstu
export const useAuth = () => {
    return useContext(AuthContext);
};

// Komponent, który będzie zarządzać stanem logowania
export const AuthProvider = ({ children, value = {} }) => {
    // Używamy wartości z `values` lub ustawiamy domyślne stany
    const [isLoggedIn, setIsLoggedIn] = useState(value.isLoggedIn ?? false);

    useEffect(() => {
        if (!value.skipCheck) {
            checkLoginStatus();
        }
    }, [value.skipCheck]);

    async function checkLoginStatus() {
        try {
            const response = await axios.get("http://172.20.0.40:5000/api/check-token", { withCredentials: true });
            setIsLoggedIn(response.data.isLoggedIn);
        } catch (error) {
            console.error("Error checking login status:", error);
            setIsLoggedIn(false);
        }
    }

    async function handleLogout() {
        try {
            await axios.post("http://172.20.0.40:5000/api/logout", {}, { withCredentials: true });
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                handleLogout: value.handleLogout || handleLogout,
                checkLoginStatus: value.checkLoginStatus || checkLoginStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
