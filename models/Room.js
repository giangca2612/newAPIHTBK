const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({

    roomCode: {
        type: String,
        required: true,
        unique: true,
    },

    //loai phong
    roomType: {
        type: String,
    },

    roomImage: {
        type: String,
    },

    roomPrice: {
        type: Number,
    },

    //trang thai phong
    roomStatus: {
        type: String,
        enum: ['phòng trống', 'phòng cho thuê'],
    },
    
    
    maxPeople : {
        type: Number,
    },

    //check xem đã hủy hay đã đặt xong set lại roomstatus
    isFinished : {
        type: Boolean,
    },

    // Khóa ngoại đến HotelDetail
    roomDetail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomDetail',
        //phong co noi bat hay k
        roomFeatured: {
            type: Boolean,
            default: false,
        },
        //dich vu giai tri cuaphong
        roomEntertain: {
            type: String,
        },
        //tien nghi
        roomConvinient: {
            type: String,
        }
    },

   
},
    //cho phép bạn tự động tạo hai trường mới trong tài liệu của mình, createdAt và updatedAt
    {
        timestamps: true
    }
);

exports.Room = mongoose.model("Room", RoomSchema);
