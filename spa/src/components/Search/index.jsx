import React, {useEffect, useState} from "react";
import axios from "axios";
import HotelTable from "../HotelTable";
import { useNavigate } from 'react-router-dom';


function Search( {searchParams} ) {

    const navigate = useNavigate()
    const [hotels, setHotels] = useState()

    useEffect(() => {
        axios.get("http://172.20.0.40:5000/api/get-hotels")
            .then(response => {
                setHotels(response.data)
            })
    }, []);

    useEffect(() => {
        axios.post("http://172.20.0.40:5000/api/get-hotels", searchParams)
            .then(response => {
                    setHotels(response.data);
                    return response.data;
                })
            .catch(reason => {
                if(reason.status === 489) {
                    console.log("Reloaded")
                }
            })
    }, [searchParams])

    function onDetailsClick(hotelId) {
        let detailsParams = {id: hotelId, ...searchParams}
        axios.post("http://172.20.0.40:5000/api/get-hotels", detailsParams)
            .then(response => {
                let hotel = response.data[0]
                navigate('/hotel-details', { state: { hotel, detailsParams } });
            })
    }

    return(
        <div>
            <h1>SEARCH RESULT</h1>
            <HotelTable hotels={hotels} onDetailsClick={onDetailsClick}/>
        </div>
    )
}

export default Search