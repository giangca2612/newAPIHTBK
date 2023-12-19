const { Hotel } = require('../models/Hotel');
const { Room } = require('../models/Room');

const createError = require('http-errors');

const createRoom = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId || null;
        const newRoom = new Room(req.body);
  
        if (hotelId) {
            const hotel = await Hotel.findById(hotelId);
            if (!hotel) {
                throw createError(404, 'Hotel not found');
            }
  
            const savedRoom = await newRoom.save();
            await Hotel.findByIdAndUpdate(hotelId, { $push: { rooms: savedRoom._id } });
            res.status(201).json({ success: true, message: 'Room created successfully', data: savedRoom });
        } else {
            const savedRoom = await newRoom.save();
            res.status(201).json({ success: true, message: 'Room created successfully', data: savedRoom });
        }
    } catch (error) {
        next(error);
    }
  };
  
  
  const updateRoomStatus = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const action = req.body.action; // 'book' or 'cancel'

        const room = await Room.findById(roomId);

        if (!room) {
            throw createError(404, 'Room not found');
        }

        // Update roomStatus based on user action
        if (action === 'book') {
            // Update roomStatus to 'booked' or another appropriate value
            room.roomStatus = 'booked';
            room.isFinished = false; // You may want to set this based on your business logic
        } else if (action === 'cancel') {
            // Update roomStatus to 'available' or another appropriate value
            room.roomStatus = 'available';
            room.isFinished = true; // You may want to set this based on your business logic
        } else {
            throw createError(400, 'Invalid action');
        }

        // Save the updated room
        const updatedRoom = await room.save();

        res.status(200).json(updatedRoom);
    } catch (error) {
        next(error);
    }
};

const deleteRoom = async (req, res, next) => {
  try {
      const roomId = req.params.id; // Change 'roomId' to 'id'

      const deletedRoom = await Room.findByIdAndDelete(roomId);

      if (!deletedRoom) {
          throw createError(404, 'Room not found');
      }

      // Remove room reference from associated hotel (if any)
      if (deletedRoom.hotel) {
          await Hotel.findByIdAndUpdate(deletedRoom.hotel, { $pull: { rooms: roomId } });
      }

      res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
      next(error);
  }
};
  
  const updateRoom = async (req, res, next) => {
    try {
        const roomId = req.params.id; // Change 'roomId' to 'id'
        const updates = req.body;

        // Validate updates before applying
        if (!updates || Object.keys(updates).length === 0) {
            throw createError(400, 'No updates provided');
        }

        const updatedRoom = await Room.findByIdAndUpdate(roomId, updates, { new: true });

        if (!updatedRoom) {
            throw createError(404, 'Room not found');
        }

        res.status(200).json(updatedRoom);
    } catch (error) {
        next(error);
    }
};

const getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRoom,
    updateRoom,
    deleteRoom,
    getAllRooms,
    updateRoomStatus
};