import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import SignIn from '../components/SignIn';
import {MemoryRouter} from "react-router-dom"; // Adjust the path based on your actual file structure

// Mock axios
jest.mock('axios');

describe('SignIn Component', () => {
    // Mock console.error globally for the test
    let consoleError;

    beforeAll(() => {
        consoleError = console.error; // Save the original console.error
        console.error = jest.fn(); // Mock console.error
    });

    afterAll(() => {
        console.error = consoleError; // Restore the original console.error after tests
    });

    it('submits form data when passwords match and makes an API call', async () => {
        // Mock the POST request
        axios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

        // Render the SignIn component
        render(
            <MemoryRouter future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <SignIn />
            </MemoryRouter>
        );

        // Fill out form fields
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText("Repeat Password"), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText("Second Name"), { target: { value: 'Doe' } });

        // Select the button using getByRole to avoid ambiguity
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert API call
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("http://172.20.0.40:5000/api/register-user", {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                secondName: 'Doe',
            });
        });

        // Assert form reset (inputs should be empty after submission)
        expect(screen.getByPlaceholderText("Email").value).toBe('');
        expect(screen.getByPlaceholderText("Password").value).toBe('');
        expect(screen.getByPlaceholderText("Repeat Password").value).toBe('');
        expect(screen.getByPlaceholderText("First Name").value).toBe('');
        expect(screen.getByPlaceholderText("Second Name").value).toBe('');
    });

    it('shows an alert when passwords do not match and prevents submission', async () => {
        // Mock alert
        window.alert = jest.fn();

        // Render the SignIn component
        render(
            <MemoryRouter future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <SignIn />
            </MemoryRouter>
        );

        // Fill out form fields with non-matching passwords
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText("Repeat Password"), { target: { value: 'password456' } });
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText("Second Name"), { target: { value: 'Doe' } });

        // Attempt to submit the form using the button
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert alert is called
        expect(window.alert).toHaveBeenCalledWith("Passwords do not match. Please try again.");

        // Assert API call is not made
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('handles API call error gracefully', async () => {
        // Mock the POST request to reject
        axios.post.mockRejectedValueOnce(new Error('API Error'));

        // Render the SignIn component
        render(
            <MemoryRouter future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <SignIn />
            </MemoryRouter>
        );

        // Fill out form fields
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText("Repeat Password"), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText("Second Name"), { target: { value: 'Doe' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Wait for the error handling
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        // Adjust the assertion to expect the actual logged format
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Error:'),
            expect.objectContaining({
                message: expect.stringContaining('API Error')
            })
        );
    });
});
