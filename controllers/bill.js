const { bill } = require('../models/Bill');

const createBill = async (req, res, next) => {
    const newBill = new Bill(req.body);

    try {
        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        next(error);
    }
};

// Update Bill by ID
const updateBill = async (req, res, next) => {
    const billId = req.params.id;

    try {
        const updatedBill = await Bill.findByIdAndUpdate(
            billId,
            req.body,
            { new: true }
        );

        if (!updatedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.status(200).json(updatedBill);
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

// Get all Bills
const getAllBills = async (req, res, next) => {
    try {
        const allBills = await Bill.find();
        res.status(200).json(allBills);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBill,
    updateBill,
    deleteBill,
    getAllBills,
};