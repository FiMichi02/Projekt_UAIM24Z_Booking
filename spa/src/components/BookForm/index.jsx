import '../SearchForm/SearchForm.css';
import axios from "axios";
import React, { useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "./BookForm.css";
import {useAuth} from "../AuthContext";

function BookForm() {
    const location = useLocation()
    const { hotel, roomId, detailsParams } = location.state || {};
    const { handleLogout } = useAuth();
    const navigate = useNavigate();

    const [localDetailsParams, setLocalDetailsParams] = useState(detailsParams || {});

    useEffect(() => {
        if (detailsParams) {
            setLocalDetailsParams(detailsParams);
        }
    }, [detailsParams]);

    const [localHotel, setLocalHotel] = useState(hotel || {})

    useEffect(() => {
        if (hotel) {
            setLocalHotel(hotel);
        }
    }, [hotel]);

    const [selectedRoomId, setSelectedRoomId] = useState(roomId);

    useEffect(() => {
        if (localHotel.available_rooms?.length > 0 && localDetailsParams.size) {
            const matchingRoom = localHotel.available_rooms.find(
                (room) => (room.Size === parseInt(localDetailsParams.size))
            );

            const currentRoom = localHotel.available_rooms.find(
                (room) => (room.ID === selectedRoomId)
            );

            if (matchingRoom && currentRoom.Size < parseInt(localDetailsParams.size)) {
                setSelectedRoomId(matchingRoom.ID);
            }
        }
    }, [localDetailsParams.size, localHotel, selectedRoomId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalDetailsParams((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Aktualizacja dostępnych pokoi po zmianie wartości formularza
    useEffect(() => {
        axios
            .post("http://172.20.0.40:5000/api/get-hotels", localDetailsParams)
            .then((response) => {
                setLocalHotel(response.data[0]);
            })
            .catch((error) => {
                console.error("Error fetching hotels:", error);
            });
    }, [localDetailsParams]);


    function book(event) {
        event.preventDefault(); // Zapobiega przeładowaniu strony
        if (!selectedRoomId) {
            alert("Please select a room before booking!");
            return;
        }
        const data = {
            room_id: selectedRoomId,
            hotel_id: localHotel.ID,
            from: localDetailsParams.from,
            to: localDetailsParams.to
        }
        axios.post("http://172.20.0.40:5000/api/make-reservation", data, {withCredentials: true})
            .then(response => {
                alert(response.data.Success)
                navigate("/profile")
            })
            .catch(error => {
                if(error.response.status === 401) {
                    alert("Error: Session probably expired, please log in again and try again")
                    handleLogout()
                    navigate("/login")
                }
            })
    }


    function handleRoomChange(newRoomId) {
        setSelectedRoomId(newRoomId)
        console.log(localDetailsParams)
    }

    return (
        <div className={"search-container"}>
            <form onSubmit={book}>
                <h1>Please, fill the form to complete the booking </h1>
                <h2>{localHotel.Name}</h2>
                <h2>{localHotel.CountryName}, {localHotel.CityName}</h2>
                <div className={"search-adults-children"}>
                    <div className={"input-group"}>
                        <label htmlFor="people">People:</label>
                        <input id="people" name="size" value={localDetailsParams.size} type={"number"} placeholder={"No of people"} onChange={handleInputChange} required/>
                    </div>
                </div>
                <div className={"search-date"}>
                    <div className={"input-group"}>
                        <label htmlFor="from">From:</label>
                        <input name="from" value={localDetailsParams.from} placeholder={"From..."} type={"date"} onChange={handleInputChange} required/>
                    </div>
                    <div className={"input-group"}>
                        <label htmlFor="to">To:</label>
                        <input name="to" value={localDetailsParams.to} placeholder={"...To"} type={"date"} onChange={handleInputChange} required/>
                    </div>
                </div>
                <h2>Available Rooms</h2>
                <div className="rooms-container">
                    {localHotel.available_rooms.map(room => (
                        <div key={room.ID} className="room-card">
                            <p><strong>Room Size:</strong> {room.Size} people</p>
                            <p><strong>Price per Night:</strong> ${room.PricePerNight}</p>
                            <button
                                type="button"
                                onClick={() => handleRoomChange(room.ID)}
                                className={`new-room-button ${selectedRoomId === room.ID ? "selected" : ""}`}
                            >
                                {selectedRoomId === room.ID ? "Selected" : "Book"}
                            </button>
                        </div>
                    ))}
                </div>
                <button type={"submit"}>Book!</button>
            </form>
        </div>
    )
}

export default BookForm;
