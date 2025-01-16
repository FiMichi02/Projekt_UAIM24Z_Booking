# coding: utf-8
from dataclasses import dataclass
from datetime import datetime

from app.db import db


@dataclass
class Booker(db.Model):
    __tablename__ = 'Booker'

    ID: int = db.Column(db.Integer, primary_key=True, nullable=False, unique=True, autoincrement=True)
    Email: str = db.Column(db.String(50), primary_key=True, nullable=False, unique=True)
    Password: str = db.Column(db.String(72))
    FirstName: str = db.Column(db.String(20), nullable=False)
    SecondName: str = db.Column(db.String(30), nullable=False)


@dataclass
class Booking(db.Model):
    __tablename__ = 'Booking'

    ID: int = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True, nullable=False)
    HotelID: int = db.Column(db.ForeignKey('Hotel.ID'), nullable=False, index=True)
    RoomID: int = db.Column(db.ForeignKey('Room.ID'), nullable=False, index=True)
    BookerEmail: str = db.Column(db.ForeignKey('Booker.Email'), nullable=False, index=True)
    From: datetime = db.Column(db.Date, nullable=False)
    To: datetime = db.Column(db.Date, nullable=False)

    Booker = db.relationship('Booker', primaryjoin='Booking.BookerEmail == Booker.Email', backref='bookings')
    Hotel = db.relationship('Hotel', primaryjoin='Booking.HotelID == Hotel.ID', backref='bookings')
    Room = db.relationship('Room', primaryjoin='Booking.RoomID == Room.ID', backref='bookings')


@dataclass()
class City(db.Model):
    __tablename__ = 'City'

    Name: str = db.Column(db.String(100), primary_key=True, nullable=False)
    CountryName: str = db.Column(db.ForeignKey('Country.Name'), primary_key=True, nullable=False, index=True)

    Country = db.relationship('Country', primaryjoin='City.CountryName == Country.Name', backref='cities')


@dataclass()
class Country(db.Model):
    __tablename__ = 'Country'

    Name: str = db.Column(db.String(100), primary_key=True, unique=True)
    Code: str = db.Column(db.String(2), nullable=False)


@dataclass()
class Hotel(db.Model):
    __tablename__ = 'Hotel'
    __table_args__ = (
        db.ForeignKeyConstraint(['CityName', 'CountryName'], ['City.Name', 'City.CountryName']),
        db.Index('Hotel_fk2', 'CityName', 'CountryName')
    )

    ID: int = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True, nullable=False)
    Name: str = db.Column(db.String(50), nullable=False)
    CountryName: str = db.Column(db.String(100), nullable=False)
    CityName: str = db.Column(db.String(100), nullable=False)

    City = db.relationship('City', primaryjoin='and_(Hotel.CityName == City.Name, Hotel.CountryName == City.CountryName)', backref='hotels')


@dataclass()
class Room(db.Model):
    __tablename__ = 'Room'

    ID: int = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True, nullable=False)
    Size: int = db.Column(db.Integer, nullable=False)
    HotelID: int = db.Column(db.ForeignKey('Hotel.ID'), nullable=False, index=True)
    PricePerNight: int = db.Column(db.Integer, nullable=False)

    Hotel = db.relationship('Hotel', primaryjoin='Room.HotelID == Hotel.ID', backref='rooms')
