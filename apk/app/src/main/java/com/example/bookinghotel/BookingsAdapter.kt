package com.example.bookinghotel

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.RecyclerView

class BookingsAdapter(private val bookings: MutableList<Booking>) : RecyclerView.Adapter<BookingsAdapter.BookingsViewHolder>() {

    inner class BookingsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val hotelNameText: TextView = itemView.findViewById(R.id.hotelNameText)
        val cityCountryText: TextView = itemView.findViewById(R.id.cityCountryText)
        val dateRangeText: TextView = itemView.findViewById(R.id.dateRangeText)
        val peopleText: TextView = itemView.findViewById(R.id.peopleText)
        val cancelButton: Button = itemView.findViewById(R.id.cancelButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookingsViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.booking_item, parent, false)
        return BookingsViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: BookingsViewHolder, position: Int) {
        val booking = bookings[position]
        holder.hotelNameText.text = booking.hotelName
        holder.cityCountryText.text = String.format("${booking.city}, ${booking.country}")
        holder.dateRangeText.text = String.format("Dates: ${booking.fromDate} - ${booking.toDate}")
        holder.peopleText.text = String.format("People: ${booking.people}")

        holder.cancelButton.setOnClickListener {
            AlertDialog.Builder(holder.itemView.context)
                .setTitle("Cancel Booking")
                .setMessage("Are you sure you want to cancel this booking?")
                .setPositiveButton("Yes") { dialog, _ ->
                    dialog.dismiss()

                    val url = "http://$ip:5000/api/cancel-booking"

                    val rawData = "{\"booking\": {\"bookingID\":${booking.bookingID}\n" +
                            "}}"

                    NetworkUtils.makeCancelPostRequest( url, rawData) { response ->
                        if (response != null && response.isSuccessful) {
                            val responseBody = response.body?.string()
                            if (responseBody?.contains("\"Success\"") == true) {
                                Handler(Looper.getMainLooper()).post {
                                    bookings.removeAt(position)
                                    notifyItemRemoved(position)
                                    notifyItemRangeChanged(position, bookings.size)
                                }
                            } else {
                                Log.e("BookingsAdapter", "Failed to cancel booking: $responseBody")
                            }
                        } else {
                            Log.e("BookingsAdapter", "Failed to cancel booking: $response")
                        }
                    }
                }
                .setNegativeButton("No") { dialog, _ ->
                    dialog.dismiss()
                }
                .create()
                .show()
        }
    }

    override fun getItemCount(): Int = bookings.size
}