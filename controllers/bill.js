const Bill = require('../models/Bill'); // Correct the import statement

const createBill = async (req, res, next) => {
    try {
        const newBill = new Bill(req.body);
        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
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
};
