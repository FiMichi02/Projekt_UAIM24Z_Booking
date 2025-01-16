package com.example.bookinghotel
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

object NetworkUtils {
    private val client = OkHttpClient.Builder().cookieJar(CookieManager()).build()
    fun makeGetRequest(url: String, callback: (String?) -> Unit) {
        val request = Request.Builder().url(url).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NetworkUtils", "GET request failed", e)
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    callback(response.body?.string())
                } else {
                    callback(null)
                }
            }
        })
    }

    fun makePostRequest(url: String, params: Map<String, String>, callback: (Response?) -> Unit) {
        val requestBodyJson = JSONObject().apply {
            params.forEach { (key, value) ->
                put(key, value)
            }
        }

        val requestBody = requestBodyJson.toString()
            .toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NetworkUtils", "POST request failed", e)
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val cookies = response.headers("Set-Cookie")
                    for (cookie in cookies) {
                        if (cookie.contains("access_token")) {
                            tokenFinal = cookie.substringAfter("access_token=").substringBefore(";")
                        }
                    }
                    callback(response)
                } else {
                    callback(null)
                }
            }
        })
    }

    fun makeCancelPostRequest(url: String, rawData: String, callback: (Response?) -> Unit) {
        val requestBody =
            rawData.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NetworkUtils", "POST request failed", e)
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    callback(response)
                } else {
                    callback(null)
                }
            }
        })
    }

    fun makeCookiePostRequest(url: String, params: Map<String, Any>, callback: (Response?) -> Unit) {
        val requestBodyJson = JSONObject().apply {
            params.forEach { (key, value) ->
                put(key, value)
            }
        }

        val requestBody = requestBodyJson.toString()
            .toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NetworkUtils", "POST request failed", e)
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    callback(response)
                } else {
                    callback(null)
                }
            }
        })
    }
}