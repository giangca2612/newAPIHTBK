const { HotelDetail } = require('../models/HotelDetail');

const createHotelDetail = async (req, res, next) => {
  
    const newHotelDetail = new HotelDetail(req.body);

    try {
        const savedHotelDetail = await newHotelDetail.save();
        res.status(200).json(savedHotelDetail);
    } catch (error) {
        next(error);
    }
}

const updateHotelDetail = async (req, res, next) => {
    const hotelId = req.params.id;

    try {
        const updatedHotelDetail = await HotelDetail.findByIdAndUpdate(
            hotelId,
            req.body,
            { new: true }
        );

        if (!updatedHotelDetail) {
            return res.status(404).json({ message: 'Hotel Detail not found' });
        }

        res.status(200).json(updatedHotelDetail);
    } catch (error) {
        next(error);
    }
};

const deleteHotelDetail = async (req, res, next) => {
    const hotelId = req.params.id;

    try {
        const deletedHotelDetail = await HotelDetail.findByIdAndDelete(hotelId);

        if (!deletedHotelDetail) {
            return res.status(404).json({ message: 'Hotel Detail not found' });
        }

        res.status(200).json({ message: 'Hotel Detail deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all Hotel Details
const getAllHotelDetails = async (req, res, next) => {
    try {
        const allHotelDetails = await HotelDetail.find();
        res.status(200).json(allHotelDetails);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createHotelDetail,
    deleteHotelDetail,
    updateHotelDetail,
    getAllHotelDetails
};