import "../AuthContext";
import { useAuth } from "../AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Profile.css"; // Dodaj stylizację dla ładnego układu

function Profile() {
    const { isLoggedIn, checkLoginStatus } = useAuth();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        checkLoginStatus()
        // Pobierz dane profilu po załadowaniu komponentu
        axios.get("http://172.20.0.40:5000/api/get-profile-data", { withCredentials: true })
            .then(response => {
                setProfileData(response.data);
            })
            .catch(error => {
                console.error("Error fetching profile data:", error);
            });
    }, []);

    if (!isLoggedIn) {
        return (
            <div>
                <h1>You must be logged in to access this page!</h1>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    const { email, bookings } = profileData;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-details">
                <h1><strong>Email:</strong> {email}</h1>
            </div>
            <h2>Bookings</h2>
            {bookings.length > 0 ? (
                <table className="bookings-table">
                    <thead>
                    <tr>
                        <th>Hotel Name</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>From</th>
                        <th>To</th>
                        <th>People</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bookings.map((booking, index) => (
                        <tr key={index}>
                            <td hidden={true}>{booking.ID}</td>
                            <td>{booking.hotelName}</td>
                            <td>{booking.city}</td>
                            <td>{booking.country}</td>
                            <td>{new Date(booking.fromDate).toLocaleDateString()}</td>
                            <td>{new Date(booking.toDate).toLocaleDateString()}</td>
                            <td>{booking.people}</td>
                            <td>
                                <button className="cancel-button" onClick={() => handleCancelBooking(index)}>Cancel</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No bookings found.</p>
            )}
        </div>
    );

    function handleCancelBooking(index) {
        // Funkcja obsługi anulowania rezerwacji (wywołasz odpowiednie API)
        const bookingToCancel = bookings[index];
        axios.post("http://172.20.0.40:5000/api/cancel-booking", { booking: bookingToCancel }, { withCredentials: true })
            .then(() => {
                alert("Booking canceled successfully!");
                setProfileData(prevData => ({
                    ...prevData,
                    bookings: prevData.bookings.filter((_, i) => i !== index)
                }));
            })
            .catch(error => {
                console.error("Error canceling booking:", error);
                alert("Failed to cancel booking.");
            });
    }
}

export default Profile;
