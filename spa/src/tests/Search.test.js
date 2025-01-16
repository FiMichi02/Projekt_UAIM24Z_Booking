import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Search from "../components/Search";
import axios from "axios";
import HotelTable from "../components/HotelTable";

jest.mock("axios");
jest.mock("../components/HotelTable", () => jest.fn(() => <div>Mocked HotelTable</div>));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Search Component", () => {
    const mockSearchParams = { location: "Paris", guests: 2 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch hotels on mount and render the result", async () => {
        const mockHotels = [
            { id: 1, name: "Hotel A", city: "Paris" },
            { id: 2, name: "Hotel B", city: "Paris" },
        ];

        // Mock the GET request
        axios.get.mockResolvedValueOnce({ data: mockHotels });

        render(
            <MemoryRouter>
                <Search searchParams={mockSearchParams} />
            </MemoryRouter>
        );

        expect(screen.getByText(/SEARCH RESULT/i)).toBeInTheDocument();

        // Wait for the GET request to complete
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("http://172.20.0.40:5000/api/get-hotels"));

        // Optionally verify the HotelTable is rendered with mock data
        expect(HotelTable).toHaveBeenCalledWith(
            { hotels: mockHotels, onDetailsClick: expect.any(Function) },
            {}
        );
    });

    it("should send search parameters and update hotels list", async () => {
        const mockHotels = [
            { id: 3, name: "Hotel C", city: "Paris" },
        ];

        // Mock the POST request
        axios.post.mockResolvedValueOnce({ data: mockHotels });

        render(
            <MemoryRouter>
                <Search searchParams={mockSearchParams} />
            </MemoryRouter>
        );

        // Wait for the POST request to complete
        await waitFor(() => expect(axios.post).toHaveBeenCalledWith("http://172.20.0.40:5000/api/get-hotels", mockSearchParams));

        // Optionally verify the HotelTable is rendered with updated mock data
        expect(HotelTable).toHaveBeenCalledWith(
            { hotels: mockHotels, onDetailsClick: expect.any(Function) },
            {}
        );
    });

    it("should navigate to hotel details on details button click", async () => {
        const mockHotels = [
            { id: 1, name: "Hotel A", city: "Paris" },
        ];

        axios.get.mockResolvedValueOnce({ data: mockHotels });
        axios.post.mockResolvedValueOnce({ data: [mockHotels[0]] });

        render(
            <MemoryRouter>
                <Search searchParams={mockSearchParams} />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Simulate onDetailsClick
        const onDetailsClick = HotelTable.mock.calls[0][0].onDetailsClick;
        onDetailsClick(1);

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith("http://172.20.0.40:5000/api/get-hotels", {
            id: 1,
            ...mockSearchParams,
        }));

        // Verify navigation is triggered with correct arguments
        expect(mockNavigate).toHaveBeenCalledWith('/hotel-details', {
            state: {
                hotel: mockHotels[0],
                detailsParams: { id: 1, ...mockSearchParams },
            },
        });
    });
});
