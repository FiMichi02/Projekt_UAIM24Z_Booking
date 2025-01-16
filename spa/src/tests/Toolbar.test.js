import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, AuthProvider } from '../components/AuthContext';
import Toolbar from '../components/Toolbar';
import axios from 'axios';

// Mockowanie axios
jest.mock('axios');

describe('Toolbar component', () => {
    test('renders login and sign-up buttons when not logged in', async () => {
        axios.get.mockResolvedValueOnce({ data: { isLoggedIn: false } });

        render(
            <AuthProvider>
                <MemoryRouter future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}>
                    <Toolbar />
                </MemoryRouter>
            </AuthProvider>
        );

        await screen.findByText(/login/i);
        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    test('renders profile and logout buttons when logged in', async () => {
        axios.get.mockResolvedValueOnce({ data: { isLoggedIn: true } });

        render(
            <AuthProvider>
                <MemoryRouter future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}>
                    <Toolbar />
                </MemoryRouter>
            </AuthProvider>
        );

        await screen.findByText(/profile/i);
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
        expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    test('calls logout and navigates to home page when Logout button is clicked', async () => {
        const mockHandleLogout = jest.fn();
        axios.get.mockResolvedValueOnce({ data: { isLoggedIn: true } });
        axios.post.mockResolvedValueOnce({});

        global.alert = jest.fn();

        render(
            <AuthProvider value={{ isLoggedIn: true, handleLogout: mockHandleLogout }}>
                <MemoryRouter future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}>
                    <Toolbar />
                </MemoryRouter>
            </AuthProvider>
        );

        fireEvent.click(screen.getByText(/logout/i));

        expect(mockHandleLogout).toHaveBeenCalled();
    });
});
