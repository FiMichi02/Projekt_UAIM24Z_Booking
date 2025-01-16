import {fireEvent, render, screen} from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import Login from '../components/Login';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));
jest.mock('../components/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('Login', () => {
    const mockSetIsLoggedIn = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue({ setIsLoggedIn: mockSetIsLoggedIn });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the LoginForm component', () => {
        render(<Login />);
        expect(screen.getByText('Log In')).toBeInTheDocument();
    });

    it('calls axios.post and handles success correctly', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        window.alert = jest.fn()

        render(<Login />);

        const loginForm = screen.getByText('Log In');
        fireEvent.submit(loginForm);

        await screen.findByText('Log In'); // Poczekaj na zakończenie operacji asynchronicznej

        expect(axios.post).toHaveBeenCalledWith(
            'http://172.20.0.40:5000/api/login',
            { email: '', password: '' },
            { withCredentials: true }
        );
        expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
        expect(window.alert).toHaveBeenCalledWith("Logged in successfully!")
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls axios.post and handles error correctly', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } });
        window.alert = jest.fn()

        render(<Login />);

        const loginForm = screen.getByText('Log In');
        fireEvent.submit(loginForm);

        await screen.findByText('Log In'); // Poczekaj na zakończenie operacji asynchronicznej

        expect(axios.post).toHaveBeenCalledWith(
            'http://172.20.0.40:5000/api/login',
            { email: '', password: '' },
            { withCredentials: true }
        );
        expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("Email or Password incorrect!")
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
