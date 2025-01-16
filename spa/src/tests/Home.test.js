import { render, screen } from '@testing-library/react';
import Home from '../components/Home';
import {MemoryRouter, Route, Routes} from "react-router-dom";

// Mocking the SearchForm component
jest.mock('../components/SearchForm', () => () => <div>Mock SearchForm</div>);
jest.mock("../components/Toolbar", () => () => <div>Mock Toolbar</div>)

test('renders all headings correctly and mocks SearchForm', () => {
    render(
        <MemoryRouter initialEntries={["/"]} future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}>
            <Routes>
                <Route path={"*"} element={<Home/>}/>
            </Routes>
        </MemoryRouter>
    );

    // Assert that there are two headings
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Home Page');

    // Assert that the mocked SearchForm is rendered
    expect(screen.getByText("Mock SearchForm")).toBeInTheDocument();
});
