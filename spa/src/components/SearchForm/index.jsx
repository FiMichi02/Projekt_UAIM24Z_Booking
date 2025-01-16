import useInput from "../hooks/useInput";
import './SearchForm.css';
import axios from "axios";
import { useEffect, useState } from "react";

function SearchForm({ searchPlace = f => f }) {

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const [name] = useInput("");
    const [size] = useInput(1);
    const [from] = useInput(todayStr);
    const [to] = useInput(tomorrowStr);
    const [country] = useInput("");
    const [city] = useInput("");

    const [countriesData, setCountriesData] = useState({});
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        axios.get("http://172.20.0.40:5000/api/get-cities-and-countries")
            .then(response => {
                const data = response.data;
                setCountriesData(data);
                const countryList = Object.keys(data);
                setCountries(countryList);
            });
    }, []);

    useEffect(() => {
        if (country.value) {
            setCities(countriesData[country.value] || []);
        }
    }, [country.value, countriesData]);

    function submit(e) {
        e.preventDefault();

        const fromDate = new Date(from.value);
        const toDate = new Date(to.value);

        // Porównanie dat
        if (fromDate > toDate) {
            alert("The 'From' date cannot be later than the 'To' date.");
            return;
        }

        searchPlace(name.value, size.value, from.value, to.value, country.value, city.value);
    }

    return (
        <div className={"search-container"}>
            <form onSubmit={submit}>
                <h1>Search for your dream trip!</h1>
                <div className={"input-group"}>
                    <label htmlFor="destination">Name:</label>
                    <input {...name} type={"text"} placeholder={"Name of hotel..."} />
                </div>
                <div className={"search-adults-children"}>
                    <div className={"input-group"}>
                        <label htmlFor="people">People:</label>
                        <input id="people" {...size} type={"number"} placeholder={"No of people"} required />
                    </div>
                </div>
                <div className={"search-date"}>
                    <div className={"input-group"}>
                        <label htmlFor="from">From:</label>
                        <input {...from} placeholder={"From..."} type={"date"} required />
                    </div>
                    <div className={"input-group"}>
                        <label htmlFor="to">To:</label>
                        <input {...to} placeholder={"...To"} type={"date"} required />
                    </div>
                </div>
                {/* Country Dropdown */}
                <div className={"search-country-city"}>
                    <div className={"input-group"}>
                        <label htmlFor="country">Country:</label>
                        <select {...country} aria-label="country-box">
                            <option value="" disabled >Select a Country</option>
                            {countries.map((countryName) => (
                                <option  key={countryName} value={countryName}>{countryName}</option>
                            ))}
                        </select>
                    </div>

                    {/* City Dropdown */}
                    <div className={"input-group"}>
                        <label htmlFor="city">City:</label>
                        <select {...city} aria-label="city-box" disabled={!country.value}>
                            <option value="" disabled>Select a City</option>
                            {cities.map((cityName) => (
                                <option key={cityName} value={cityName}>{cityName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type={"submit"}>Search</button>
            </form>
        </div>
    )
}

export default SearchForm;
