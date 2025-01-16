import React from 'react';
import { Table } from 'antd';
import "./HotelTable.css";

const HotelTable = ({ hotels, onDetailsClick = f => f }) => {

    const columns = [
        {
            title: 'Name',
            dataIndex: 'Name',
            key: 'name',
            width: '25%',
        },
        {
            title: 'City',
            dataIndex: 'CityName',
            key: 'city',
            width: '25%',
        },
        {
            title: 'Country',
            dataIndex: 'CountryName',
            key: 'country',
            width: '25%',
        },
        {
            title: 'Book',
            key: 'book',
            width: '25%',
            render: (text, record) => (
                <div className="row-button-container">
                    <button
                        onClick={() => onDetailsClick(record.ID)}>
                        Book
                    </button>
                </div>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        const roomColumns = [
            {
                title: 'Size',
                dataIndex: 'Size',
                key: 'size',
                width: '50%',
            },
            {
                title: 'Price Per Night',
                dataIndex: 'PricePerNight',
                key: 'pricePerNight',
                width: '50%',
                render: (text) => `$${text}`
            },
        ];

        return (
            <div className="ant-table-expanded-row-content">
                <Table
                    columns={roomColumns}
                    dataSource={record.available_rooms}
                    pagination={false}
                    rowKey="ID"
                />
            </div>
        );
    };

    return (
        <div className="table-container">
            <Table
                columns={columns}
                dataSource={hotels}
                expandable={{ expandedRowRender }}
                pagination={false}
                rowKey="ID"
            />
        </div>
    );
};

export default HotelTable;
