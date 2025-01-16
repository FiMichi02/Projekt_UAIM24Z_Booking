import {render, fireEvent, screen} from '@testing-library/react';
import LoginForm from '../components/Login/LoginForm';

describe('LoginForm', () => {
    it('renders input fields and a submit button', () => {
        render(<LoginForm />);

        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
        expect(screen.getByText("Log In")).toBeInTheDocument()
    });

    it('calls getCreds with email and password on form submission', () => {
        const mockGetCreds = jest.fn();
        render(<LoginForm getCreds={mockGetCreds} />);

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const submitButton = screen.getByText('Log In');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(mockGetCreds).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('resets input fields after form submission', () => {
        const mockGetCreds = jest.fn();
        render(<LoginForm getCreds={mockGetCreds} />);

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const submitButton = screen.getByText('Log In');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
    });
});
