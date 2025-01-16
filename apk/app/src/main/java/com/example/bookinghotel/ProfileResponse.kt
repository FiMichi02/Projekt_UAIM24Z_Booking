package com.example.bookinghotel

data class ProfileResponse(
    val bookings: List<Booking>,
    val email: String
)

data class Booking(
    val bookingID: Int,
    val city: String,
    val country: String,
    val fromDate: String,
    val hotelName: String,
    val people: Int,
    val toDate: String
)