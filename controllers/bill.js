const Bill = require('../models/Bill'); // Correct the import statement
const { Hotel } = require('../models/Hotel');  // Import Hotel model
const { Room } = require('../models/Room'); 

const createBill = async (req, res, next) => {
    try {
        const {
            thongtinpp,
            billMonney,
            imageHotelBill,
            billInfo,
            startbill,
            dateCheckin,
            dateCheckout,
            hotelId,
            roomId,
            isFinished // Make sure isFinished is present in the request body
        } = req.body;

        if (!thongtinpp || !billMonney || !imageHotelBill || !billInfo || !startbill || !dateCheckin || !dateCheckout || !hotelId || !roomId) {
            return res.status(400).json({ error: 'Missing required fields in the request body.' });
        }

        // Check if the hotel exists
        const hotel = await Hotel.findById(hotelId).populate({
            path: 'rooms',
            populate: { path: 'billID' }
        }).populate('hotelDetail');

        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Check if the room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the room is already associated with a bill
        if (room.billID) {
            // If room already has an associated bill, update the existing bill
            const existingBill = await Bill.findById(room.billID);

            if (existingBill) {  // Check if existingBill is not null
                existingBill.thongtinpp = thongtinpp;
                existingBill.billMonney = billMonney;
                existingBill.imageHotelBill = imageHotelBill;
                existingBill.billInfo = billInfo;
                existingBill.startbill = startbill;
                existingBill.dateCheckin = dateCheckin;
                existingBill.dateCheckout = dateCheckout;

                await existingBill.save();

                res.status(200).json({
                    updatedBill: existingBill,
                    room: {
                        _id: room._id,
                        roomCode: room.roomCode,
                        roomType: room.roomType,
                        roomImage: room.roomImage,
                        roomPrice: room.roomPrice,
                        roomStatus: room.roomStatus,
                        maxPeople: room.maxPeople,
                        createdAt: room.createdAt,
                        updatedAt: room.updatedAt,
                        isFinished: room.isFinished,
                        billID: room.billID,
                    },
                });
            } else {
                // If existingBill is null, create a new bill
                const newBill = new Bill({
                    thongtinpp,
                    billMonney,
                    imageHotelBill,
                    billInfo,
                    startbill,
                    dateCheckin,
                    dateCheckout,
                });

                // Link the bill to the room and save
                room.billID = newBill._id;
                room.isFinished = isFinished || false; // Set isFinished to the provided value or false if not present
                await room.save();

                const savedBill = await newBill.save();

                res.status(201).json({
                    savedBill,
                    room: {
                        _id: room._id,
                        roomCode: room.roomCode,
                        roomType: room.roomType,
                        roomImage: room.roomImage,
                        roomPrice: room.roomPrice,
                        roomStatus: room.roomStatus,
                        maxPeople: room.maxPeople,
                        createdAt: room.createdAt,
                        updatedAt: room.updatedAt,
                        isFinished: room.isFinished,
                        billID: room.billID,
                    },
                });
            }
        } else {
            // If room does not have an associated bill, create a new bill
            const newBill = new Bill({
                thongtinpp,
                billMonney,
                imageHotelBill,
                billInfo,
                startbill,
                dateCheckin,
                dateCheckout,
            });

            // Link the bill to the room and save
            room.billID = newBill._id;
            room.isFinished = isFinished || false; // Set isFinished to the provided value or false if not present
            await room.save();

            const savedBill = await newBill.save();

            res.status(201).json({
                savedBill,
                room: {
                    _id: room._id,
                    roomCode: room.roomCode,
                    roomType: room.roomType,
                    roomImage: room.roomImage,
                    roomPrice: room.roomPrice,
                    roomStatus: room.roomStatus,
                    maxPeople: room.maxPeople,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt,
                    isFinished: room.isFinished,
                    billID: room.billID,
                },
            });
        }
    } catch (error) {
        console.error('Error creating/updating bill:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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

const deleteBill = async (req, res, next) => {
    const hotelId = req.body.hotelId;
    const roomId = req.body.roomId;
    
    try {
        // Check if the hotel exists
        const hotel = await Hotel.findById(hotelId).populate({
            path: 'rooms',
            populate: { path: 'billID' }
        }).populate('hotelDetail');

        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Check if the room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the room is associated with a bill
        if (!room.billID) {
            return res.status(400).json({ error: 'Room does not have an associated bill.' });
        }

        const billId = room.billID;

        const deletedBill = await Bill.findByIdAndDelete(billId);

        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Update the room to remove the reference to the deleted bill
        room.billID = null;
        await room.save();

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
    getAllBills,
    getBillById,
    deleteBill
};
