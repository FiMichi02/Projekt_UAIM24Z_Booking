package com.example.bookinghotel

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class SignUpActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        val homeButton: Button = findViewById(R.id.homeButton)
        val loginButton: Button = findViewById(R.id.loginButton)
        val emailInput: EditText = findViewById(R.id.emailInput)
        val passwordInput: EditText = findViewById(R.id.passwordInput)
        val repeatPasswordInput: EditText = findViewById(R.id.repeatPasswordInput)
        val firstNameInput: EditText = findViewById(R.id.firstNameInput)
        val secondNameInput: EditText = findViewById(R.id.secondNameInput)
        val signupButton: Button = findViewById(R.id.signupSubmitButton)

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
            if (emailInput.text.toString().isEmpty() or passwordInput.text.toString().isEmpty() or repeatPasswordInput.text.toString().isEmpty() or firstNameInput.text.toString().isEmpty() or secondNameInput.text.toString().isEmpty()) {
                runOnUiThread {
                    AlertDialog.Builder(this@SignUpActivity)
                        .setTitle("Signup Failed")
                        .setMessage("Please fill in all fields")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                        }
                        .show()
                }
            } else if (passwordInput.text.toString() != repeatPasswordInput.text.toString()) {
                runOnUiThread {
                    AlertDialog.Builder(this@SignUpActivity)
                        .setTitle("Signup Failed")
                        .setMessage("Passwords are not the same")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                        }
                        .show()
                }
            } else {
                val url = "http://$ip:5000/api/register-user"
                val params = mutableMapOf<String, String>()
                params["email"] = emailInput.text.toString()
                params["password"] = passwordInput.text.toString()
                params["firstName"] = firstNameInput.text.toString()
                params["secondName"] = secondNameInput.text.toString()
                NetworkUtils.makePostRequest(url, params) { response ->
                    Log.d("SignupActivity", "POST Response: $response")
                    if (response != null) {
                        if (response.code == 200) {
                            runOnUiThread {
                                AlertDialog.Builder(this@SignUpActivity)
                                    .setTitle("Signup successful")
                                    .setMessage("Account created")
                                    .setPositiveButton("OK") { dialog, _ ->
                                        dialog.dismiss()
                                        val intent = Intent(this, LoginActivity::class.java)
                                        startActivity(intent)
                                        finish()
                                    }
                                    .show()
                            }
                        } else {
                            runOnUiThread {
                                AlertDialog.Builder(this@SignUpActivity)
                                    .setTitle("Signup failed")
                                    .setMessage("Check the fields or try again later")
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
