const express = require('express');
const router = express.Router();

const { createHotelDetail, updateHotelDetail, deleteHotelDetail, getAllHotelDetails} = require("../controllers/hotelDetail");

router.post('/', createHotelDetail);
router.put('/update/:id', updateHotelDetail);
router.delete('/delete/:id', deleteHotelDetail);
router.get('/getallhoteldetail', getAllHotelDetails);

module.exports = router;