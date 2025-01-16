
import SearchForm from "../SearchForm";
import Search from "../Search";
import {useEffect, useState} from "react";
import HotelDetails from "../HotelDetails";
import {Route, Routes, useNavigate} from "react-router-dom";

function Home() {

    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useState({size: 1});

    // Funkcja do aktualizacji stanu, wywoływana przez SearchForm
    function handleSearch(name, size, from, to, country, city){
        setSearchParams({
            size: size, city: city, country: country,
            from: from, name: name, to: to
        });
        navigate("/search")
    }

    useEffect(() => {
        console.log(searchParams);
    }, [searchParams]);



    return(
        <div>
            <h1>Home Page</h1>
            <SearchForm searchPlace={
                handleSearch
            }></SearchForm>
            <Routes>
                <Route path="/search" element={<Search searchParams={searchParams}/>}/>
                <Route path="/hotel-details" element={<HotelDetails hotel={{id:1}}/>}/>
            </Routes>
        </div>
    )
}

export default Home;