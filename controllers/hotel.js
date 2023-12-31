const { Hotel } = require('../models/Hotel');
const { Room } = require('../models/Room');

const createHotel = async (req, res, next) => {
    try {
        // Create a new hotel using the request body
        const newHotel = new Hotel(req.body);
        // Save the new hotel to the database
        const savedHotel = await newHotel.save();
        res.status(200).json(savedHotel);
    } catch (error) {
        next(error);
    }
}

const getAllHotels = async (req, res, next) => {
    try {
        const allHotels = await Hotel.find();
        res.status(200).json(allHotels);
    } catch (error) {
        next(error);
    }
}

const updateHotel = async (req, res, next) => {
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedHotel);
    } catch (error) {
        next(error);
    }
}

const deleteHotel = async (req, res, next) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

const getHotelById = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.status(200).json(hotel);
    } catch (error) {
        next(error);
    }
}

const deleteRoom = async (req, res, next) => {
    try {
        const { hotelId, roomId } = req.params;

        // Find the hotel by ID
        const hotel = await Hotel.findById(hotelId);

        // Find and remove the room from the hotel's rooms array
        hotel.rooms.pull(roomId);

        // Save the updated hotel
        await hotel.save();

        res.status(204).end(); // Room deleted successfully
    } catch (error) {
        next(error);
    }
};

const searchHotels = async (req, res, next) => {
    try {
        const { queryType, value } = req.query;
        const query = {};

        if (queryType === 'phoneNumberHotel' && value) {
            query.phoneNumberHotel = isNaN(value) ? value : parseInt(value);
        } else if (queryType === 'hotelCity' && value) {
            query.hotelCity = { $regex: new RegExp(value, 'i') };
        } else if (queryType === 'hotelName' && value) {
            query.hotelName = { $regex: new RegExp(value, 'i') };
        } else {
            return res.status(400).json({ message: 'Invalid query type or value' });
        }

        console.log('Query:', query);

        const hotels = await Hotel.find(query).populate('rooms'); // Populate the 'rooms' field

        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
};

//luot dat phong nhieu 
const getMostBookedRoomDetails = async (req, res, next) => {
    try {
        // Định nghĩa pipeline cho aggregation
        const pipeline = [
            {
                $unwind: '$rooms',
            },
            {
                $group: {
                    _id: '$rooms',
                    totalBookings: { $sum: 1 },
                },
            },
            {
                $sort: { totalBookings: -1 },
            },
            {
                $limit: 1,
            },
            {
                // Thực hiện left outer join với collection 'rooms' dựa trên '_id' của phòng
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'roomDetails',
                },
            },
            {
                $unwind: '$roomDetails',
            },
            {
                // Tạo cấu trúc kết quả cuối cùng
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    room: '$roomDetails',
                },
            },
        ];

        // Thực hiện aggregation trên collection Hotel
        const result = await Hotel.aggregate(pipeline);

        // Kiểm tra kết quả aggregation
        if (result.length === 0) {
            // Nếu không có kết quả, trả về mã lỗi 404 với thông báo tương ứng
            return res.status(404).json({ message: 'Không tìm thấy thông tin phòng được đặt nhiều nhất' });
        }

        // Nếu có kết quả, trả về thông tin về phòng được đặt nhiều nhất cùng với tổng số lần đặt
        res.status(200).json(result[0]);
    } catch (error) {
        // Xử lý lỗi nếu có
        next(error);
    }
};

const deleteAllHotels = async (req, res, next) => {
    try {
        // Delete all hotels from the database
        await Hotel.deleteMany({});
        
        // Optionally, you may also delete all associated rooms
        // await Room.deleteMany({});

        res.status(204).end(); // Hotels deleted successfully
    } catch (error) {
        next(error);
    }
};

const getHotelDetails = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('rooms').populate('hotelDetail');
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.status(200).json(hotel);
    } catch (error) {
        next(error);
    }
}

const getHotelRooms = async (req, res, next) => {
    try {
        // Populate the 'rooms' field to get details of all rooms associated with all hotels
        const hotels = await Hotel.find({})
            .populate({
                path: 'rooms',
                populate: {
                    path: 'roomDetail',
                },
            })
            .populate('hotelDetail');

        if (!hotels) {
            return res.status(404).json({ message: 'No hotels found' });
        }

        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
};

const getHotelRoomsByHotelId = async (req, res, next) => {
    try {
        const hotelId = req.params.id;

        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId)
            .populate({
                path: 'rooms',
                populate: {
                    path: 'roomDetail', // If you want to populate roomDetail as well
                },
            })
            .populate('hotelDetail');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.status(200).json({ hotel, rooms: hotel.rooms });
    } catch (error) {
        res.status(400);
        next(error);
    }
};


const getHotelRoomsSua = async (req, res, next) => {
    try {
        // const hotelId = req.params.hotelId;
        // const roomId = req.params.roomId;

        // Find the hotel by ID with populated rooms and hotelDetail
        const hotel = await Hotel.find(hotelId)
            .populate({
                path: 'rooms',
                populate: {
                    path: 'roomDetail',
                },
            })
            .populate('hotelDetail');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Find the specific room by ID
        const room = hotel.rooms.find((r) => r._id.toString() === roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Convert the hotel and room documents to plain JavaScript objects
        const hotelData = hotel.toObject();
        const roomData = room.toObject();

        res.status(200).json({ hotel: hotelData, room: roomData });
    } catch (error) {
        next(error);
    }
};

const hotelandroombyid = async (req, res, next) => {
    try {
      const { hotelId, roomId } = req.params;
  
      // Check if hotelId and roomId are provided
      if (!hotelId || !roomId) {
        return res.status(400).json({ error: 'Both hotelId and roomId are required parameters.' });
      }
  
      // Find the hotel by ID
      const hotel = await Hotel.findById(hotelId);
  
      // Check if the hotel exists
      if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found.' });
      }
  
      // Find the room by ID
      const room = await Room.findById(roomId);
  
      // Check if the room exists
      if (!room) {
        return res.status(404).json({ error: 'Room not found.' });
      }
  
      // Return the combined information of hotel and room
      return res.status(200).json({ hotel, room });
    } catch (error) {
      console.error('Error fetching hotel and room details:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateRoomDetailsById = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const roomId = req.params.roomId;
        const { roomType, roomPrice, roomStatus } = req.body;

        // Create an object with the fields to update
        const updateFields = {};
        if (roomType) updateFields.roomType = roomType;
        if (roomPrice) updateFields.roomPrice = roomPrice;
        if (roomStatus) updateFields.roomStatus = roomStatus;

        // If you want to update the hotelName of the associated hotel
        const hotelName = req.body.hotelName; // Get hotelName from the request body
        if (hotelName) {
            // Update hotelName in the Hotel model
            await Hotel.findByIdAndUpdate(
                hotelId,
                { $set: { hotelName: hotelName } }
            );
        }

        // Use findByIdAndUpdate to update the room in the database
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({ message: 'Update successful', room: updatedRoom });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createHotel,
    getHotelRooms,
    getAllHotels,
    updateHotel,
    deleteHotel,
    getHotelById,
    // existing functions...
    searchHotels,
    getHotelDetails,
    deleteRoom,
    getHotelRoomsSua,
    updateRoomDetailsById,
    getMostBookedRoomDetails,
    deleteAllHotels,
    getHotelRoomsByHotelId,
    hotelandroombyid
};