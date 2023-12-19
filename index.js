const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//routes
const usersRouter = require('./routers/users');
const authRouter = require('./routers/auth');
const hotelRouter = require('./routers/hotels');
const hotelDetailRouter = require('./routers/hotelsdetail');
const roomRouter = require('./routers/rooms');
const billRoutes = require('./routers/bill');

const app = express();
dotenv.config();

//mongoodb
const db_conect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("monggo thanh cong");
    } catch (error) {
        throw error;
    }
}
//middleware
app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/hotel', hotelRouter);
app.use('/api/hoteldetail', hotelDetailRouter);
app.use('/api/room', roomRouter);
app.use('/api/bill', billRoutes);

app.listen(4567, () => {
    db_conect()
    console.log(`sever chay post 4567`)
})