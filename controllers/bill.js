const Bill = require('../models/Bill'); // Correct the import statement

const createBill = async (req, res, next) => {
    try {
        const {
            thongtinpp,
            billMonney,
            imageHotelBill,
            billInfo,
            startbill,
            hotelcitybill,
            dateCheckin,
            dateCheckout
        } = req.body;

        if (!thongtinpp || !billMonney || !imageHotelBill || !billInfo || !startbill || !hotelcitybill || !dateCheckin || !dateCheckout) {
            return res.status(400).json({ error: 'Missing required fields in the request body.' });
        }

        const newBill = new Bill({
            thongtinpp,
            billMonney,
            imageHotelBill,
            billInfo,
            startbill,
            hotelcitybill,
            dateCheckin,
            dateCheckout,
        });

        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        console.error('Error creating bill:', error);
        // Log the detailed error message and status code
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
        // Call next() to pass the error to the next middleware
        next(error);
    }
};

// Get Bill by ID
const getBillById = async (req, res, next) => {
    const billId = req.params.id;

    try {
        const foundBill = await Bill.findById(billId).populate('userID', 'username email').exec();
        // Use populate to include the user details (username and email) from the 'User' model

        if (!foundBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.status(200).json(foundBill);
    } catch (error) {
        next(error);
    }
};

// Delete Bill by ID
const deleteBill = async (req, res, next) => {
    const billId = req.params.id;

    try {
        const deletedBill = await Bill.findByIdAndDelete(billId);

        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteAllBills = async (req, res, next) => {
    try {
        const result = await Bill.deleteMany();

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No bills found to delete' });
        }

        res.status(200).json({ message: 'All bills deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all Bills
const getAllBills = async (req, res, next) => {
    try {
        const allBills = await Bill.find().populate('userID', 'username email').exec();
        // Use populate to include the user details (username and email) from the 'User' model
        res.status(200).json(allBills);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBill,
    deleteBill,
    getAllBills,
    getBillById,
    deleteAllBills
};
