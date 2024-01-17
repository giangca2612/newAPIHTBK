const express = require('express');
const router = express.Router();

const { createHotel, getHotelRooms, getAllHotels, updateHotel, deleteHotel, getHotelById, searchHotels,
    getHotelDetails,
    deleteRoom, getHotelRoomsSua, updateRoomDetailsById, getMostBookedRoomDetails, deleteAllHotels, getHotelRoomsByHotelId, hotelandroombyid ,
    updateroomstatusbyhotelidroomid, findroomstatuschoxacnhanandbill,findhotelcocabill,findngayhienroom,updatestatusdadat,findroomstatusdaxacnhanandbill,
    findroomstatusdaxacnhanandbillbyidhotelidroom} = require("../controllers/hotel");

//Tìm kiếm khách sạn theo thành phố và các thông số khác:
// Search hotels based on criteria
router.get('/search', searchHotels);

//getroomtheongay
router.post('/findroomtheongay/:id', findngayhienroom);

//bill và room  phòng chờ xác nhận 
router.get('/findbillandroomchoxacnhan/', findroomstatuschoxacnhanandbill);

router.get('/findroomstatusdaxacnhanandbill/', findroomstatusdaxacnhanandbill);

router.get('/findroomstatusdaxacnhanandbillbyidhotelidroom/:hotelId/:roomId', findroomstatusdaxacnhanandbillbyidhotelidroom);

router.get('/findhotelcocabill/:id', findhotelcocabill);

//doanh thu 
router.get('/getMostBookedRoomDetails', getMostBookedRoomDetails );

//updatestatus thành đã đặt phòng 
router.put('/updatestatusdadat/:hotelId/:roomId', updatestatusdadat);

router.post('/', createHotel);
router.get('/', getAllHotels);

router.put('/:id', updateHotel);

router.delete('/:id', deleteHotel);

router.get('/:id', getHotelById);

//Chi tiết khách sạn:
router.get('/details/:hotelId/:roomId', getHotelDetails);

// router.get('/rooms/:id', getHotelRooms);
router.get('/rooms/chitietht', getHotelRooms);

// Delete a specific room by ID
router.delete('/rooms/:hotelId/:roomId', deleteRoom);

//hien len form để sửa 
// Updated route for fetching hotel details for editing
// router.get('/rooms/chitietht/:hotelId/:roomId', getHotelRoomsSua);
router.get('/rooms/chitietht/', getHotelRoomsSua);

// Add the POST route for updating data
router.put('/hotels/rooms/update/:hotelId/:roomId', updateRoomDetailsById);

router.delete('/all/hotels',deleteAllHotels);

//lay phong ra theo id
router.get('/:id/rooms',getHotelRoomsByHotelId);

router.get('/hotelandroom/:hotelId/:roomId', hotelandroombyid);

//update status
router.put('/updateroomstatus/:hotelId/:roomId', updateroomstatusbyhotelidroomid);

module.exports = router;