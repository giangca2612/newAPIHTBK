const { Hotel } = require('../models/Hotel');
const { Room } = require('../models/Room');
const { Bill } = require('../models/Bill');
const { HotelDetail } = require('../models/HotelDetail');

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
        const hotels = await Hotel.find({}).populate('hotelDetail');

        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
};

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
        const hotelId = req.params.id;

        // Find the hotel to get associated rooms and hotel detail
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            throw createError(404, 'Hotel not found');
        }

        // Remove all associated rooms
        if (hotel.rooms && hotel.rooms.length > 0) {
            await Room.deleteMany({ _id: { $in: hotel.rooms } });
        }

        // Remove associated hotel detail
        if (hotel.hotelDetail) {
            await HotelDetail.findByIdAndDelete(hotel.hotelDetail);
        }

        // Delete the hotel itself
        await Hotel.findByIdAndDelete(hotelId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

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
        const hotel = await Hotel.findById(req.params.hotelId).populate('rooms').populate('hotelDetail');
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Find the room within the hotel by room ID
        const room = hotel.rooms.find(room => room._id.toString() === req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found in the specified hotel' });
        }

        // Return both hotel, hotelDetail, and room details
        res.status(200).json({
            hotel: {
                _id: hotel._id,
                hotelName: hotel.hotelName,
                hotelAddress: hotel.hotelAddress,
                // Add other hotel details as needed
                hotelRates: hotel.hotelRates,
                hotelDetail: hotel.hotelDetail,
                createdAt: hotel.createdAt,
                updatedAt: hotel.updatedAt,
            },
            room: {
                _id: room._id,
                roomCode: room.roomCode,
                roomType: room.roomType,
                roomImage: room.roomImage,
                roomPrice: room.roomPrice,
                // Add other room details as needed
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
            }
        });
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

        // Create a new object with the desired structure
        const formattedHotelData = {
            _id: hotel._id,
            hotelName: hotel.hotelName,
            hotelAddress: hotel.hotelAddress,
            hotelCity: hotel.hotelCity,
            phoneNumberHotel: hotel.phoneNumberHotel,
            hotelRates: hotel.hotelRates,
            hotelFeedback: hotel.hotelFeedback,
            rooms: hotel.rooms.map(room => ({
                ...room.toObject(), // Include all room properties
                roomDetail: room.roomDetail ? { ...room.roomDetail.toObject() } : null,
            })),
            hotelRates: hotel.hotelRates,
            hotelDetail: {
                ...hotel.hotelDetail.toObject(), // Include all hotelDetail properties
            },
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
            __v: hotel.__v,
        };

        res.status(200).json(formattedHotelData);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const findngayhienroom = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const { startDate, endDate } = req.body;

        // Check if startDate and endDate are provided
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Please provide both start and end dates.' });
        }

        // Find the hotel by ID and populate its rooms
        const hotel = await Hotel.findById(hotelId).populate('rooms');

        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found with the provided ID.' });
        }

        // Filter available rooms based on the date range
        const availableRooms = hotel.rooms.filter(room => {
            const roomStartDate = new Date(room.startDate);
            const roomEndDate = new Date(room.endDate);
            const searchStartDate = new Date(startDate);
            const searchEndDate = new Date(endDate);

            // Check if the room's availability overlaps with the provided date range
            return (
                roomStartDate <= searchEndDate &&
                roomEndDate >= searchStartDate
            );
        });

        // Extract relevant information for the response
        const hotelInfo = {
            _id: hotel._id,
            hotelName: hotel.hotelName,
            hotelAddress: hotel.hotelAddress,
            // Add other hotel details as needed
        };

        const roomInfo = availableRooms.map(room => ({
            _id: room._id,
            roomCode: room.roomCode,
            roomType: room.roomType,
            roomImage: room.roomImage,
            roomPrice: room.roomPrice,
            roomStatus: room.roomStatus,
            maxPeople: room.maxPeople,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            startDate: room.startDate,
            endDate: room.endDate,
            // Add other room details as needed
        }));

        // Return the combined hotel and room information
        res.json({ hotel: hotelInfo, availableRooms: roomInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while searching for available rooms.' });
    }
};

const updatestatusdadat = async (req, res, next) => {
    try {
        const { hotelId, roomId } = req.params;

        // Check if hotelId and roomId are provided
        if (!hotelId || !roomId) {
            return res.status(400).json({ error: 'Both hotelId and roomId are required parameters.' });
        }

        // Find the room by ID
        const existingRoom = await Room.findById(roomId);

        // Check if the room exists
        if (!existingRoom) {
            return res.status(404).json({ error: 'Room not found.' });
        }

        // Check if the current roomStatus is 'phòng chờ xác nhận'
        if (existingRoom.roomStatus === 'phòng chờ xác nhận') {
            // Update roomStatus to 'phòng đã được thuê'
            existingRoom.roomStatus = 'phòng đã được thuê';
            existingRoom.isFinished = true; // Set isFinished to true or false based on your logic
            await existingRoom.save();

            // Fetch the updated room details
            const updatedRoomDetails = await Room.findById(roomId);

            // Return the updated room information
            return res.status(200).json({ room: updatedRoomDetails, message: 'Room status updated successfully.' });
        } else {
            return res.status(400).json({ error: 'Room is not in the correct status for update.' });
        }
    } catch (error) {
        console.error('Error updating room status:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getHotelRoomsSua = async (req, res, next) => {
    try {
        // Retrieve all hotels and populate rooms
        const hotels = await Hotel.find()
            .populate({
                path: 'rooms',
                populate: {
                    path: 'roomDetail',
                },
            })
            .lean();

        if (!hotels || hotels.length === 0) {
            return res.status(404).json({ message: 'No hotels found' });
        }


        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ message: 'No rooms found' });
        }
        
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

const updateroomstatusbyhotelidroomid = async (req, res, next) => {
    try {
      const { hotelId, roomId } = req.params;
  
      // Check if hotelId and roomId are provided
      if (!hotelId || !roomId) {
        return res.status(400).json({ error: 'Both hotelId and roomId are required parameters.' });
      }
  
      // Find the room by ID
      const existingRoom = await Room.findById(roomId);
  
      // Check if the room exists
      if (!existingRoom) {
        return res.status(404).json({ error: 'Room not found.' });
      }
  
      // Update roomStatus to 'phòng đã được thuê'
      existingRoom.roomStatus = 'phòng chờ xác nhận';
      existingRoom.isFinished = true; // Set isFinished to true or false based on your logic
      await existingRoom.save();
  
      // Fetch the updated room details
      const updatedRoomDetails = await Room.findById(roomId);
  
      // Return the updated room information
      return res.status(200).json({ room: updatedRoomDetails });
    } catch (error) {
      console.error('Error updating room status:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
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

const findroomstatuschoxacnhanandbill = async (req, res, next) => {
    try {
        // Lấy danh sách khách sạn với thông tin về phòng, bao gồm cả thông tin Bill
        const hotelsWithRoomsAndBills = await Hotel.find().populate({
            path: 'rooms',
            populate: {
                path: 'billID',
            },
        });

        // Lọc ra những khách sạn và phòng thỏa mãn điều kiện
        const filteredRooms = [];
        hotelsWithRoomsAndBills.forEach(hotel => {
            hotel.rooms.forEach(room => {
                // Kiểm tra xem có phòng thỏa mãn điều kiện hay không
                if (room.roomStatus === "phòng chờ xác nhận" && room.billID !== null) {
                    filteredRooms.push({
                        hotelName: hotel.hotelName,
                        hotelAddress: hotel.hotelAddress,
                        roomCode: room.roomCode,
                        roomType: room.roomType,
                        roomImage: room.roomImage,
                        roomPrice: room.roomPrice,
                        roomStatus: room.roomStatus,
                        maxPeople: room.maxPeople,
                        billID: room.billID,
                        // Thêm thông tin từ Bill vào đây
                        // billInfo: room.billID ? {
                        //     dateCheckin: room.billID.dateCheckin,
                        //     dateCheckout: room.billID.dateCheckout,
                        //     thongtinpp: room.billID.thongtinpp,
                        //     billInfo: room.billID.billInfo,
                        //     imageHotelBill: room.billID.imageHotelBill,
                        //     hotelcitybill: room.billID.hotelcitybill,
                        //     startbill: room.billID.startbill,
                        //     namebillroom: room.billID.namebillroom,
                        //     billMonney: room.billID.billMonney,
                        //     userID: room.billID.userID,
                        //     paymentDetails: room.billID.paymentDetails,
                        // } : null,
                    });
                }
            });
        });

        // Trả về kết quả
        res.status(200).json(filteredRooms);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const findroomstatusdaxacnhanandbill = async (req, res, next) => {
    try {
        // Lấy danh sách khách sạn với thông tin về phòng, bao gồm cả thông tin Bill
        const hotelsWithRoomsAndBills = await Hotel.find().populate({
            path: 'rooms',
            populate: {
                path: 'billID',
            },
        });

        // Lọc ra những khách sạn và phòng thỏa mãn điều kiện
        const filteredRooms = [];
        hotelsWithRoomsAndBills.forEach(hotel => {
            hotel.rooms.forEach(room => {
                // Kiểm tra xem có phòng thỏa mãn điều kiện hay không
                if (room.roomStatus === "phòng đã được thuê" && room.billID !== null) {
                    filteredRooms.push({
                        hotelID: hotel._id, // Add hotel ID
                        roomID: room._id,
                        hotelName: hotel.hotelName,
                        hotelAddress: hotel.hotelAddress,
                        roomCode: room.roomCode,
                        roomType: room.roomType,
                        roomImage: room.roomImage,
                        roomPrice: room.roomPrice,
                        roomStatus: room.roomStatus,
                        maxPeople: room.maxPeople,
                        billID: room.billID,
                        // Thêm thông tin từ Bill vào đây
                        // billInfo: room.billID ? {
                        //     dateCheckin: room.billID.dateCheckin,
                        //     dateCheckout: room.billID.dateCheckout,
                        //     thongtinpp: room.billID.thongtinpp,
                        //     billInfo: room.billID.billInfo,
                        //     imageHotelBill: room.billID.imageHotelBill,
                        //     hotelcitybill: room.billID.hotelcitybill,
                        //     startbill: room.billID.startbill,
                        //     namebillroom: room.billID.namebillroom,
                        //     billMonney: room.billID.billMonney,
                        //     userID: room.billID.userID,
                        //     paymentDetails: room.billID.paymentDetails,
                        // } : null,
                    });
                }
            });
        });

        // Trả về kết quả
        res.status(200).json(filteredRooms);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const findroomstatusdaxacnhanandbillbyidhotelidroom = async (req , res , next) => {
    try {
        const { hotelId, roomId } = req.params; // Assuming hotelId and roomId are part of the request parameters

        // Lấy danh sách khách sạn với thông tin về phòng, bao gồm cả thông tin Bill
        const hotelsWithRoomsAndBills = await Hotel.findById(hotelId).populate({
            path: 'rooms',
            populate: {
                path: 'billID',
            },
        });

        if (!hotelsWithRoomsAndBills) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Lọc ra phòng thỏa mãn điều kiện với roomId cụ thể
        const filteredRooms = [];
        hotelsWithRoomsAndBills.rooms.forEach(room => {
            // Kiểm tra xem có phòng thỏa mãn điều kiện hay không
            if (room._id.toString() === roomId && room.roomStatus === "phòng đã được thuê" && room.billID !== null) {
                filteredRooms.push({
                    hotelName: hotelsWithRoomsAndBills.hotelName,
                    hotelAddress: hotelsWithRoomsAndBills.hotelAddress,
                    roomCode: room.roomCode,
                    roomType: room.roomType,
                    roomImage: room.roomImage,
                    roomPrice: room.roomPrice,
                    roomStatus: room.roomStatus,
                    maxPeople: room.maxPeople,
                    billID: {
                        // Include only necessary fields from the bill
                        paymentDetails: room.billID.paymentDetails,
                        dateCheckin: room.billID.dateCheckin,
                        dateCheckout: room.billID.dateCheckout,
                        thongtinpp: room.billID.thongtinpp,
                        billInfo: room.billID.billInfo,
                        imageHotelBill: room.billID.imageHotelBill,
                        startbill: room.billID.startbill,
                        billMonney: room.billID.billMonney,
                        userID: room.billID.userID,
                    },
                });
            }
        });

        // Trả về kết quả
        res.status(200).json(filteredRooms);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const findhotelcocabill = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
    
        // Tìm kiếm khách sạn dựa trên ID
        const hotel = await Hotel.findById(hotelId)
          .populate({
            path: 'rooms',
            populate: {
              path: 'billID',
            },
          });
    
        if (!hotel) {
          return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
        }
    
        res.json(hotel); // Trả về thông tin đầy đủ của khách sạn, phòng và hóa đơn
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra.' });
      }
}

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
    hotelandroombyid,
    updateroomstatusbyhotelidroomid,
    findroomstatuschoxacnhanandbill,
    findhotelcocabill,
    findngayhienroom,
    updatestatusdadat,
    findroomstatusdaxacnhanandbill,
    findroomstatusdaxacnhanandbillbyidhotelidroom
};