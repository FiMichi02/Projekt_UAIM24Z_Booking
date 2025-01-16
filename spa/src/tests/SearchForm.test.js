import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import SearchForm from '../components/SearchForm';
import axios from 'axios';
import userEvent from "@testing-library/user-event";
jest.mock('axios');

const consoleError = console.error;
let mockConsoleError: jest.SpyInstance;
beforeAll(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation((...args) => {
        const message = typeof args[0] === 'string' ? args[0] : '';
        if (
            message.includes('When testing, code that causes React state updates should be wrapped into act(...)') ||
            message.includes('antd')
        ) {
            return;
        }

        return consoleError.call(console, args);
    });
});

afterAll(() => {
    mockConsoleError.mockRestore();
});

describe('SearchForm', () => {
    const mockSearchPlace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with all fields and default values', async () => {
        axios.get.mockResolvedValue({
            data: {
                USA: ['New York', 'Los Angeles'],
                Canada: ['Toronto', 'Vancouver'],
            },
        });

        render(<SearchForm searchPlace={mockSearchPlace} />);

        // Sprawdzenie obecności wszystkich elementów
        expect(screen.getByText(/Search for your dream trip!/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Name of hotel.../i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/No of people/i)).toHaveValue(1);
        expect(screen.getByPlaceholderText(/From.../i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/...To/i)).toBeInTheDocument();
        expect(screen.getByText(/Select a Country/i)).toBeInTheDocument();
        expect(screen.getByText(/Select a City/i)).toBeInTheDocument();

        // Oczekiwanie na załadowanie dropdowna z krajami
        await screen.findByText('USA');
        expect(screen.getByText('Canada')).toBeInTheDocument();
    });

    it('updates cities dropdown based on selected country', async () => {
        // Mockowanie odpowiedzi API
        axios.get.mockResolvedValueOnce({
            data: {
                USA: ['New York', 'Los Angeles'],
                Canada: ['Toronto', 'Vancouver'],
            },
        });

        render(<SearchForm />);


        await screen.findByRole('option', { name: 'USA' });
        expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument();

        await userEvent.selectOptions(
            screen.getByRole('combobox', { name: "country-box"}),
            "Canada"
            )


        // Oczekiwanie na aktualizację dropdowna z miastami
        await screen.findByText('Toronto');
        expect(screen.getByText('Vancouver')).toBeInTheDocument();
    });

    it('submits the form with incorrect dates', async () => {
        axios.get.mockResolvedValue({
            data: {
                USA: ['New York', 'Los Angeles'],
                Canada: ['Toronto', 'Vancouver'],
            },
        });

        window.alert = jest.fn()

        render(<SearchForm searchPlace={mockSearchPlace} />);

        await screen.findByText('USA');

        // Uzupełnij formularz
        fireEvent.change(screen.getByPlaceholderText(/Name of hotel.../i), { target: { value: 'Hotel California' } });
        fireEvent.change(screen.getByPlaceholderText(/No of people/i), { target: { value: 3 } });
        fireEvent.change(screen.getByPlaceholderText(/From.../i), { target: { value: '2025-01-10' } });
        fireEvent.change(screen.getByPlaceholderText(/...To/i), { target: { value: '2025-01-09' } });
        await userEvent.selectOptions(
            screen.getByRole('combobox', { name: "country-box"}),
            "USA"
        )
        await screen.findByText('New York');
        await userEvent.selectOptions(
            screen.getByRole('combobox', { name: "city-box"}),
            "New York"
        )
        // Wyślij formularz
        fireEvent.click(screen.getByRole('button', /Search/i));

        // Sprawdzenie wywołania funkcji
        expect(window.alert).toHaveBeenCalledWith("The 'From' date cannot be later than the 'To' date.")
    });


    it('submits the form with correct values', async () => {
        axios.get.mockResolvedValue({
            data: {
                USA: ['New York', 'Los Angeles'],
                Canada: ['Toronto', 'Vancouver'],
            },
        });

        await render(<SearchForm searchPlace={mockSearchPlace} />);

        await screen.findByText('USA');

        // Uzupełnij formularz
        fireEvent.change(screen.getByPlaceholderText(/Name of hotel.../i), { target: { value: 'Hotel California' } });
        fireEvent.change(screen.getByPlaceholderText(/No of people/i), { target: { value: 3 } });
        fireEvent.change(screen.getByPlaceholderText(/From.../i), { target: { value: '2025-01-10' } });
        fireEvent.change(screen.getByPlaceholderText(/...To/i), { target: { value: '2025-01-15' } });
        await userEvent.selectOptions(
            screen.getByRole('combobox', { name: "country-box"}),
            "USA"
        )
        await screen.findByText('New York');
        await userEvent.selectOptions(
            screen.getByRole('combobox', { name: "city-box"}),
            "New York"
        )
        // Wyślij formularz
        fireEvent.click(screen.getByRole('button', /Search/i));

        // Sprawdzenie wywołania funkcji
        expect(mockSearchPlace).toHaveBeenCalledWith(
            'Hotel California',
            "3",
            '2025-01-10',
            '2025-01-15',
            'USA',
            'New York'
        );
    });
});
