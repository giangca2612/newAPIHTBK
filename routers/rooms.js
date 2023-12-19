const express = require('express');
const router = express.Router();

const { createRoom, updateRoom, deleteRoom, getAllRooms, updateRoomStatus } = require("../controllers/room");

router.post('/', createRoom);
router.put("/:id", updateRoom);
router.delete("/:id",deleteRoom);
router.get('/rooms', getAllRooms);

//patch chỉ cần gửi các trường cập nhập
router.patch('/rooms/:id/updatestatus', updateRoomStatus);

module.exports = router;