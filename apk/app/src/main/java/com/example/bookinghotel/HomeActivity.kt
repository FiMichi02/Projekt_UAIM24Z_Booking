package com.example.bookinghotel

import Hotel
import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

const val ip = "192.168.1.15"
class HomeActivity : AppCompatActivity() {

    private lateinit var hotelsLayout: LinearLayout
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        val homeButton: Button = findViewById(R.id.homeButton)
        val loginButton: Button = findViewById(R.id.loginButton)
        loginButton.text = String.format("Login")
        val signupButton: Button = findViewById(R.id.signupButton)
        signupButton.text = String.format("Sign Up")
        val searchButton: Button = findViewById(R.id.searchButton)
        val hotelNameInput: EditText = findViewById(R.id.hotelNameInput)
        val peopleInput: EditText = findViewById(R.id.peopleInput)
        val fromDate: EditText = findViewById(R.id.fromDate)
        val toDate: EditText = findViewById(R.id.toDate)
        val countryInput: Spinner = findViewById(R.id.countryInput)
        val cityInput: Spinner = findViewById(R.id.cityInput)

        NetworkUtils.makeGetRequest("http://$ip:5000/api/get-cities-and-countries") { response ->
            try {
                countryInput.adapter = null
                cityInput.adapter = null

                val jsonResponse = JSONObject(response.toString())
                val countryCityMap = mutableMapOf<String, List<String>>()

                jsonResponse.keys().forEach { country ->
                    val cities = jsonResponse.getJSONArray(country).let { array ->
                        List(array.length()) { index -> array.getString(index) }
                    }
                    countryCityMap[country] = cities
                }

                val countries = mutableListOf("Select Country") + countryCityMap.keys.toList()
                val countryAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, countries)
                countryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                countryInput.adapter = countryAdapter

                countryInput.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                    override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                        val selectedCountry = countries[position]
                        if (selectedCountry == "Select Country") {
                            cityInput.adapter = null
                        } else {
                            val cities = countryCityMap[selectedCountry] ?: emptyList()
                            val cityAdapter = ArrayAdapter(this@HomeActivity, android.R.layout.simple_spinner_item, cities)
                            cityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                            cityInput.adapter = cityAdapter
                        }
                    }

                    override fun onNothingSelected(parent: AdapterView<*>) {
                        cityInput.adapter = null
                    }
                }

            } catch (e: JSONException) {
                Log.e("HomeActivity", "Failed to parse response", e)
            }
        }

        homeButton.setOnClickListener {
            val intent = Intent(this, HomeActivity::class.java)
            startActivity(intent)
            finish()
        }
        loginButton.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
        signupButton.setOnClickListener {
            val intent = Intent(this, SignUpActivity::class.java)
            startActivity(intent)
            finish()
        }

        hotelsLayout = findViewById(R.id.hotelsLayout)

        searchButton.setOnClickListener {

            val hotelName = hotelNameInput.text.toString()
            val people = peopleInput.text.toString()
            val country = countryInput.selectedItem?.toString()
            val city = cityInput.selectedItem?.toString()

            val params = mutableMapOf<String, String>()

            if (hotelName.isNotEmpty()) params["name"] = hotelName
            if (people.isNotEmpty()) params["size"] = people else params["size"] = "1"
            if (country?.isNotEmpty() == true) params["country"] = country
            if (city?.isNotEmpty() == true) params["city"] = city

            val inputFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
            val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val fromDateStr = fromDate.text.toString().takeIf { it.isNotEmpty() }
                ?.let { inputFormat.parse(it)?.let { date -> outputFormat.format(date) } }
                ?: outputFormat.format(Calendar.getInstance().time)

            val toDateStr = toDate.text.toString().takeIf { it.isNotEmpty() }
                ?.let { inputFormat.parse(it)?.let { date -> outputFormat.format(date) } }
                ?: outputFormat.format(Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, 1) }.time)

            params["from"] = fromDateStr
            params["to"] = toDateStr

            if (hotelName.isEmpty() && people.isEmpty() && country == "Select Country" && city.isNullOrEmpty()) {
                val url = "http://$ip:5000/api/get-hotels"
                NetworkUtils.makeGetRequest(url) { response ->
                    if (response != null) {
                        val hotels = parseHotelsResponse(response)
                        updateUIWithHotels(hotels)
                    }
                }
            } else {
                val url = "http://$ip:5000/api/get-hotels"
                NetworkUtils.makePostRequest(url, params) { response ->
                    if (response != null) {
                        if (response.body?.toString() != null) {
                            Log.i("WOOOO", response.body?.toString()!!)
                            val hotels = parseHotelsResponse(response.body?.string()!!)
                            updateUIWithHotels(hotels)
                        }
                    }
                }
            }
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
    }

    private fun parseHotelsResponse(response: String): List<Hotel> {
        val hotelListType = object : TypeToken<List<Hotel>>() {}.type
        return Gson().fromJson(response, hotelListType)
    }

    private fun updateUIWithHotels(hotels: List<Hotel>) {
        runOnUiThread {
            hotelsLayout.removeAllViews()

            for (hotel in hotels) {
                val hotelRow = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    setPadding(16, 8, 16, 8)
                }

                val hotelNameTextView = TextView(this).apply {
                    text = hotel.Name
                    layoutParams =
                        LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                    textSize = 18f
                    setTextColor(Color.BLACK)
                }

                val bookButton = Button(this).apply {
                    text = String.format("Book")
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    )
                    setOnClickListener {
                        Log.d("HomeActivity", "Book button clicked for Hotel ID: ${hotel.ID}")
                        val intent = Intent(this@HomeActivity, LoginActivity::class.java)
                        startActivity(intent)
                        finish()
                    }
                }
                hotelRow.addView(hotelNameTextView)
                hotelRow.addView(bookButton)

                hotelsLayout.addView(hotelRow)
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
