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
    billInfo: {
        type: String,
        required: true,
    },
    imageHotelBill: {
        type: String,
    },
    hotelcitybill: {
        type: String,
    },
    billMonney: {
        type: Number,
        required: true,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

const Bill = mongoose.model("Bill", BillSchema);

module.exports = Bill;
