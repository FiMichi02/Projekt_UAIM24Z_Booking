import android.os.Parcel
import android.os.Parcelable

data class Hotel(
    val CityName: String?,
    val CountryName: String?,
    val ID: Int,
    val Name: String?,
    val available_rooms: List<Room>
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString(),
        parcel.readString(),
        parcel.readInt(),
        parcel.readString(),
        parcel.createTypedArrayList(Room)!!
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(CityName)
        parcel.writeString(CountryName)
        parcel.writeInt(ID)
        parcel.writeString(Name)
        parcel.writeTypedList(available_rooms)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<Hotel> {
        override fun createFromParcel(parcel: Parcel): Hotel {
            return Hotel(parcel)
        }

        override fun newArray(size: Int): Array<Hotel?> {
            return arrayOfNulls(size)
        }
    }
}

data class Room(
    val HotelID: Int,
    val ID: Int,
    val PricePerNight: Int,
    val Size: Int
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readInt(),
        parcel.readInt(),
        parcel.readInt(),
        parcel.readInt()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeInt(HotelID)
        parcel.writeInt(ID)
        parcel.writeInt(PricePerNight)
        parcel.writeInt(Size)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<Room> {
        override fun createFromParcel(parcel: Parcel): Room {
            return Room(parcel)
        }

        override fun newArray(size: Int): Array<Room?> {
            return arrayOfNulls(size)
        }
    }
}