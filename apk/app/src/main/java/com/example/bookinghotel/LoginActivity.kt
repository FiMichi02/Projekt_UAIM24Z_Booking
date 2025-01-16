package com.example.bookinghotel

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val homeButton: Button = findViewById(R.id.homeButton)
        val signupButton: Button = findViewById(R.id.signupButton)
        val loginInput: EditText = findViewById(R.id.loginInput)
        val passwordInput: EditText = findViewById(R.id.passwordInput)
        val loginButton: Button = findViewById(R.id.loginSubmitButton)

        homeButton.setOnClickListener {
            val intent = Intent(this, HomeActivity::class.java)
            startActivity(intent)
            finish()
        }

        signupButton.setOnClickListener {
            val intent = Intent(this, SignUpActivity::class.java)
            startActivity(intent)
            finish()
        }
        loginButton.setOnClickListener {
            if (loginInput.text.isEmpty() or passwordInput.text.isEmpty()) {
                runOnUiThread {
                    AlertDialog.Builder(this@LoginActivity)
                        .setTitle("Login Failed")
                        .setMessage("Please fill in all fields")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                        }
                        .show()
                }
            } else {
                val url = "http://$ip:5000/api/login"
                val params = mutableMapOf<String, String>()
                params["email"] = loginInput.text.toString()
                params["password"] = passwordInput.text.toString()
                NetworkUtils.makePostRequest(url, params) { response ->
                    Log.d("LoginActivity", "POST Response: $response")
                    if (response != null) {
                        if (response.code == 200) {
                            runOnUiThread {
                                val intent = Intent(this, LoggedinActivity::class.java)
                                startActivity(intent)
                                tokenFinal = loginInput.text.toString()
                                finish()
                            }
                            Log.i("DEEEEEE", response.body?.string()!!)
                        } else {
                            runOnUiThread {
                                AlertDialog.Builder(this@LoginActivity)
                                    .setTitle("Login Failed")
                                    .setMessage("Wrong email or password!")
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