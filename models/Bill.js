const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    dateCheckin: {
        type: Date,
        required: true,
    },
    dateCheckout: {
        type: Date,
        required: true,
    },
    thongtinpp: {
        type: String,
    },
    billInfo: {
        type: String,
    },
    imageHotelBill: {
        type: String,
    },
    hotelcitybill: {
        type: String,
    },
    startbill: {
        type: String,
    },
    namebillroom: {
        type: String,
    },
    billMonney: {
        type: Number,
        required: true,
    },
    // New Fields
    roomType: {
        type: String,
    },
    roomMaxPeople: {
        type: Number,
    },
    roomImage: {
        type: String,
    },
    totalAmount: {
        type: Number,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    paymentDetails: {
        dayStay: {
            type: Date,
            default: null,
        },
        guest: {
            type: Number,
        },
        priceStay: {
            type: String,
        },
        taxAndFee: {
            type: String,
        },
        method: {
            type: String,
        },
        total: {
            type: String,
        },
    },
}, {
    timestamps: true,
});

const Bill = mongoose.model('Bill', BillSchema);

module.exports = Bill;
