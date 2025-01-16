@file:Suppress("DEPRECATION")

package com.example.bookinghotel

import Hotel
import android.annotation.SuppressLint
import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class BookingActivity : AppCompatActivity() {
    @SuppressLint("DiscouragedApi", "SimpleDateFormat")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking)

        val homeButton: Button = findViewById(R.id.homeButton)
        val logoutButton: Button = findViewById(R.id.loginButton)
        logoutButton.text = String.format("Logout")
        val profileButton: Button = findViewById(R.id.signupButton)
        profileButton.text = String.format("Profile")
        val hotelNameText: TextView = findViewById(R.id.hotelName)
        val locationNameText: TextView = findViewById(R.id.locationName)
        val hotel = intent.getParcelableExtra<Hotel>("hotel_data")
        val peopleInput: EditText = findViewById(R.id.peopleInput)
        hotel?.let {
            val hotelName = it.Name
            val countryName = it.CountryName
            val cityName = it.CityName
            hotelNameText.text = hotelName
            locationNameText.text = String.format(cityName.toString() + ", " + countryName)
        }

        val fromDate: EditText = findViewById(R.id.fromDate)
        val toDate: EditText = findViewById(R.id.toDate)

        homeButton.setOnClickListener {
            val intent = Intent(this, LoggedinActivity::class.java)
            startActivity(intent)
            finish()
        }
        logoutButton.setOnClickListener {
            val url = "http://$ip:5000/api/logout"
            val params = mutableMapOf<String, String>()
            NetworkUtils.makePostRequest(url, params) { response ->
                try {
                    val responseBody = response?.body?.string()
                    val jsonObject = JSONObject(responseBody.toString())
                    val logout = jsonObject.optBoolean("logout", false)
                    if (logout) {
                        val intent = Intent(this, HomeActivity::class.java)
                        startActivity(intent)
                        finish()
                    }
                } catch (e: JSONException) {
                    Log.e("LoginActivity", "Error parsing response: ${e.message}")
                }
            }
        }
        profileButton.setOnClickListener {
            val intent = Intent(this, ProfileActivity::class.java)
            startActivity(intent)
            finish()
        }

        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Europe/Warsaw"))
        val today = calendar.time
        calendar.add(Calendar.DAY_OF_YEAR, 1)
        val tomorrow = calendar.time

        fromDate.setText(formatDate(today))
        toDate.setText(formatDate(tomorrow))

        fromDate.setOnClickListener {
            showDatePicker(fromDate)
        }

        toDate.setOnClickListener {
            showDatePicker(toDate)
        }
        hotel?.let {
            for (i in hotel.available_rooms.size+1..6) {
                val linearLayoutID = "room$i" + "Layout"
                val resID =
                    resources.getIdentifier(
                        linearLayoutID,
                        "id",
                        "com.example.bookinghotel"
                    )
                val roomLinearLayout: LinearLayout = findViewById(resID)
                roomLinearLayout.visibility = View.GONE
            }
            val checkboxes = mutableListOf<CheckBox>()
            for (i in 1..hotel.available_rooms.size) {
                val detailsID = "room$i"+"Details"
                val dID = resources.getIdentifier(
                    detailsID,
                    "id",
                    "com.example.bookinghotel"
                )
                val roomDetails: TextView = findViewById(dID)
                roomDetails.text = String.format("Room size: "+hotel.available_rooms[i-1].Size+"    Price per night: $"+hotel.available_rooms[i-1].PricePerNight)
                val checkboxID = "room$i"+"Checkbox"
                val cID = resources.getIdentifier(
                    checkboxID,
                    "id",
                    "com.example.bookinghotel"
                )
                checkboxes.add(findViewById(cID))
            }
            checkboxes.forEach { checkbox ->
                checkbox.setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        checkboxes.filter { it != checkbox }.forEach { it.isChecked = false }
                    }
                }
            }
            peopleInput.addTextChangedListener {
                for (i in 1..hotel.available_rooms.size) {

                    if (peopleInput.text.isNotEmpty()) {
                        if (peopleInput.text.toString()
                                .toInt() > hotel.available_rooms[i - 1].Size
                        ) run {
                            val linearLayoutID = "room$i" + "Layout"
                            val lLID =
                                resources.getIdentifier(
                                    linearLayoutID,
                                    "id",
                                    "com.example.bookinghotel"
                                )
                            val roomLinearLayout: LinearLayout = findViewById(lLID)
                            checkboxes[i-1].isChecked = false
                            roomLinearLayout.visibility = View.GONE
                        } else {
                            val linearLayoutID = "room$i" + "Layout"
                            val lLID =
                                resources.getIdentifier(
                                    linearLayoutID,
                                    "id",
                                    "com.example.bookinghotel"
                                )
                            val roomLinearLayout: LinearLayout = findViewById(lLID)
                            roomLinearLayout.visibility = View.VISIBLE
                        }
                    }
                }
            }
            val bookButton: Button = findViewById(R.id.bookButton)
            bookButton.setOnClickListener {
                for (checkbox in checkboxes) {
                    if (checkbox.isChecked) {
                        val bookRoomID = hotel.available_rooms[checkboxes.indexOf(checkbox)].ID.toString()
                        val bookHotelID = hotel.ID.toString()
                        val url = "http://$ip:5000/api/make-reservation"
                        val params = mutableMapOf<String, String>()
                        if (bookRoomID.isNotEmpty()) params["room_id"] = bookRoomID
                        if (bookHotelID.isNotEmpty()) params["hotel_id"] = bookHotelID
                        val finalFromDate = SimpleDateFormat("dd/MM/yyyy").parse(fromDate.text.toString())?.let {
                            SimpleDateFormat("yyyy-MM-dd").format(it)
                        }
                        val finalToDate = SimpleDateFormat("dd/MM/yyyy").parse(toDate.text.toString())?.let {
                            SimpleDateFormat("yyyy-MM-dd").format(it)
                        }
                        if (finalFromDate.toString().isNotEmpty()) params["from"] = finalFromDate.toString()
                        if (finalToDate.toString().isNotEmpty()) params["to"] = finalToDate.toString()
                        NetworkUtils.makeCookiePostRequest(url, params) { response ->
                            if (response != null) {
                                if (response.code == 200) {
                                    runOnUiThread {
                                        AlertDialog.Builder(this@BookingActivity)
                                            .setTitle("Reservation complete!")
                                            .setMessage(hotel.Name+"\nSize: "+hotel.available_rooms[checkboxes.indexOf(checkbox)].Size+", $"+hotel.available_rooms[checkboxes.indexOf(checkbox)].PricePerNight+" per night")
                                            .setPositiveButton("OK") { dialog, _ ->
                                                dialog.dismiss()
                                                val intent = Intent(this, ProfileActivity::class.java)
                                                startActivity(intent)
                                                finish()
                                            }
                                            .show()
                                    }
                                } else {
                                    runOnUiThread {
                                        AlertDialog.Builder(this@BookingActivity)
                                            .setTitle("Reservation failed")
                                            .setMessage("Check the dates or try again later")
                                            .setPositiveButton("OK") { dialog, _ ->
                                                dialog.dismiss()
                                            }
                                            .show()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun showDatePicker(dateEditText: EditText) {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Europe/Warsaw"))
        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)
                dateEditText.setText(formatDate(calendar.time))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )
        datePickerDialog.show()
    }

    private fun formatDate(date: Date): String {
        val format = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
        return format.format(date)
    }
}