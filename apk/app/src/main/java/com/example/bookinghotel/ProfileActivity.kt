package com.example.bookinghotel

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import org.json.JSONException
import org.json.JSONObject

class ProfileActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val rootView = findViewById<View>(R.id.rootLayout)
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, insets ->
            val systemBarsInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(0, systemBarsInsets.top, 0, systemBarsInsets.bottom)
            insets
        }

        val logoutButton: Button = findViewById(R.id.loginButton)
        logoutButton.text = String.format("Logout")
        val homeButton: Button = findViewById(R.id.homeButton)
        val profileButton: Button = findViewById(R.id.signupButton)
        profileButton.text = String.format("Profile")
        val userName: TextView = findViewById(R.id.userName)


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

        val url = "http://$ip:5000/api/get-profile-data"
        NetworkUtils.makeGetRequest(url) { response ->
            val gson = Gson()
            val profileResponse: ProfileResponse =
                gson.fromJson(response, ProfileResponse::class.java)
            val bookings: MutableList<Booking> = profileResponse.bookings.toMutableList()
            runOnUiThread {
                userName.text = profileResponse.email
                val bookingsRecyclerView: RecyclerView = findViewById(R.id.bookingsRecyclerView)
                bookingsRecyclerView.layoutManager = LinearLayoutManager(this)
                bookingsRecyclerView.adapter = BookingsAdapter(bookings)
            }
        }
    }
}