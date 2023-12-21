const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()
const path = require('path');


//routes
const usersRouter = require('./routers/users');
const authRouter = require('./routers/auth');
const hotelRouter = require('./routers/hotels');
const hotelDetailRouter = require('./routers/hotelsdetail');
const roomRouter = require('./routers/rooms');
const billRoutes = require('./routers/bill');
const indexRoutes = require('./routers/index');

const app = express();
dotenv.config();

// Cài đặt tùy chọn CORS trước khi sử dụng app
const corsOptions = {
    origin: 'http://localhost:4567', // Thay đổi thành địa chỉ của ứng dụng React Native của bạn
    credentials: true,
  };
  app.use(cors(corsOptions));
  
const POST = process.env.PORT || 4567

//mongoodb
const db_conect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("monggo thanh cong");
    } catch (error) {
        //console.log("connect faild" + error);
    }
}
//middleware
app.use(cors())
app.use(cookieParser())
app.use(express.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.engine('handlebars', hbs.engine);
app.set('view engine', 'hbs');

app.use('/', indexRoutes);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/hoteldetail', hotelDetailRouter);
app.use('/api/room', roomRouter);
app.use('/api/bill', billRoutes);

app.listen(POST, () => {
    db_conect()
    console.log(`sever chay post ${POST}`)
})