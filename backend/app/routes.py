from dataclasses import asdict
from datetime import datetime

import bcrypt
from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, set_access_cookies, unset_jwt_cookies

from app.db import db
from app.models import Booker, Hotel, Booking


def init_routes(app):

    @app.route('/api/register-user', methods=['POST'])
    def register_user():
        body = request.get_json()
        email = body['email']
        password = body['password'].encode()
        first_name = body['firstName']
        second_name = body['secondName']

        password = bcrypt.hashpw(password, bcrypt.gensalt())

        new_booker = Booker(Email=email, Password=password, FirstName=first_name, SecondName=second_name)

        db.session.add(new_booker)
        db.session.commit()

        return jsonify({"Success": "New booker registered successfully!"}), 200

    @app.route('/api/login', methods=['POST'])
    def login():
        body = request.get_json()
        email = body['email']
        password = body['password'].encode()

        booker = Booker.query.filter_by(Email=email).first()
        if not booker:
            return jsonify({"Error": "Email or password not correct!"}), 400

        if bcrypt.checkpw(password, booker.Password.encode()):
            token = create_access_token(identity=email)
            response = jsonify({"Success": "Logged in successfully!"})
            set_access_cookies(response, token)
            return response, 200

        return jsonify({"Error": "Email or password not correct!"}), 400

    @app.route("/api/get-cities-and-countries", methods=['GET'])
    def get_cities():
        hotels = Hotel.query.all()

        country_cities = {}

        for hotel in hotels:
            city = hotel.CityName
            country = hotel.CountryName
            if country not in country_cities:
                country_cities[country] = []
                country_cities[country].append(city)
            else:
                country_cities[country].append(city)

        return jsonify(country_cities)

    @app.route("/api/get-hotels", methods=['GET', 'POST'])
    def get_hotels():

        if request.method == "GET":
            hotels = Hotel.query.all()
            hotels_rooms = []
            for hotel in hotels:
                rooms = hotel.rooms
                available_rooms = []
                for room in rooms:
                    available_rooms.append(room)
                if len(available_rooms) != 0:
                    hotel = asdict(hotel)
                    hotel['available_rooms'] = available_rooms
                    hotels_rooms.append(hotel)
            return jsonify(hotels_rooms)

        elif request.method == "POST" and request.get_json() != {}:
            filters = request.get_json()

            query = Hotel.query

            if "name" in filters and filters["name"] != '':
                query = query.filter(Hotel.Name.ilike(f"%{filters['name']}%"))
            if "city" in filters and filters["city"] != '':
                query = query.filter(Hotel.CityName == filters["city"])
            if "country" in filters and filters["country"] != '':
                query = query.filter(Hotel.CountryName == filters["country"])
            if "id" in filters and filters["id"] != '':
                query = query.filter(Hotel.ID == filters["id"])

            hotels = query.all()
            hotels_rooms = []
            for hotel in hotels:
                rooms = hotel.rooms
                available_rooms = []
                for room in rooms:
                    bookings = room.bookings
                    add = True
                    for booking in bookings:
                        if booking.From <= datetime.strptime(filters["to"], '%Y-%m-%d').date() or booking.To >= datetime.strptime(filters["from"], '%Y-%m-%d').date():
                            add = False
                            break
                    if room.Size < int(filters["size"]):
                        add = False
                    if add:
                        available_rooms.append(room)
                if len(available_rooms) != 0:
                    hotel = asdict(hotel)
                    hotel['available_rooms'] = available_rooms
                    hotels_rooms.append(hotel)
                else:
                    hotel = asdict(hotel)
                    hotel['available_rooms'] = []
                    hotels_rooms.append(hotel)

            return jsonify(hotels_rooms)

        elif request.get_json() == {}:
            return jsonify({"Reload": "paged refreshed"}), 489

    @app.route("/api/make-reservation", methods=['POST'])
    @jwt_required()
    def make_reservation():
        data = request.get_json()
        email = get_jwt_identity()
        room_id = data.get("room_id")
        hotel_id = data.get("hotel_id")
        from_date = datetime.strptime(data.get("from"), "%Y-%m-%d")
        to_date = datetime.strptime(data.get("to"), "%Y-%m-%d")
        if not all([room_id, hotel_id, from_date, to_date]):
            return jsonify({"Error": "Missing data!"}), 400
        if from_date >= to_date:
            return jsonify({"Error": "From date cannot be greater than to date!"}), 400

        reservation = Booking(HotelID=hotel_id, RoomID=room_id, From=from_date, To=to_date, BookerEmail=email)
        db.session.add(reservation)
        db.session.commit()

        return jsonify({"Success": "Booking successfully added"}), 200

    @app.route("/api/check-token", methods=['GET'])
    @jwt_required()
    def check_token():
        return jsonify({"isLoggedIn": True}), 200

    @app.route("/api/logout", methods=['POST'])
    def logout():
        resp = jsonify({'logout': True})
        unset_jwt_cookies(resp)
        return resp, 200

    @app.route("/api/get-profile-data", methods=['GET'])
    @jwt_required()
    def get_profile():
        email = get_jwt_identity()
        bookings = Booking.query.filter_by(BookerEmail=email).all()

        data = {"email": email, "bookings": []}
        for booking in bookings:
            hotel_name = booking.Hotel.Name
            country = booking.Hotel.CountryName
            city = booking.Hotel.CityName
            from_date = booking.From
            to_date = booking.To
            people = booking.Room.Size
            booking_id = booking.ID
            to_add = {
                "bookingID": booking_id,
                "hotelName": hotel_name,
                "country": country,
                "city": city,
                "fromDate": from_date,
                "toDate": to_date,
                "people": people
            }
            data["bookings"].append(to_add)

        return jsonify(data)

    @app.route("/api/cancel-booking", methods=['POST'])
    @jwt_required()
    def cancel_booking():
        data = request.get_json()
        booking = data.get("booking")
        booking_id = booking.get("bookingID")
        print(data)
        email = get_jwt_identity()
        booking_cancel = Booking.query.filter_by(BookerEmail=email, ID=booking_id).first()
        if booking_cancel:
            db.session.delete(booking_cancel)
            db.session.commit()
            return jsonify({"Success": "Booking cancelled"}), 200
        return jsonify({"Error": "Booking not found"}), 404