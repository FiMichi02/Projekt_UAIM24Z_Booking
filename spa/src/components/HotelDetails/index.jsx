import React, {useEffect} from "react";
import './HotelDetails.css';
import {useLocation, useNavigate} from 'react-router-dom';

function HotelDetails() {
    const location = useLocation();
    const { hotel, detailsParams } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        console.log(detailsParams)
    });

    if (!hotel) {
        return <p style={{display:"flex", justifyContent:"center"}}>Hotel not found!</p>;
    }

    // Funkcja obsługująca kliknięcie przycisku rezerwacji
    const handleBookClick = (hotel, roomId) => {
        navigate("/new-booking", { state: { hotel, roomId, detailsParams } })
    };

    return (
        <div className="hotel-details-container">
            <h1>{hotel.Name}</h1>
            <div className="hotel-info">
                <p><strong>City:</strong> {hotel.CityName}</p>
                <p><strong>Country:</strong> {hotel.CountryName}</p>
            </div>

            <h2>Available Rooms</h2>
            <div className="rooms-container">
                {hotel.available_rooms.map(room => (
                    <div key={room.ID} className="room-card">
                        <p><strong>Room Size:</strong> {room.Size} people</p>
                        <p><strong>Price per Night:</strong> ${room.PricePerNight}</p>
                        <button
                            onClick={() => handleBookClick(hotel, room.ID)}
                            className="book-button"
                        >
                            Book
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HotelDetails;
