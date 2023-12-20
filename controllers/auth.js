// Dòng này import thư viện bcryptjs để mã hóa mật khẩu của người dùng.
const bcrypt = require('bcryptjs');
// const {createError} = require('../views/error.jade');
const jwt = require('jsonwebtoken');

// controllers/auth.js
const { User } = require('../models/User');

// Export lớp User dưới dạng một hàm khởi tạo
exports.default = User;

exports.register = async (req, res, next) => {
  try {
    // Tạo một salt mới.
    const salt = bcrypt.genSaltSync(10);

    // Mã hóa mật khẩu của người dùng bằng salt.
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Tạo một người dùng mới với mật khẩu đã mã hóa.
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    // Lưu người dùng mới vào cơ sở dữ liệu.
    await newUser.save();

    // Gửi phản hồi cho người dùng.
    res.status(200).send('User Has been Created');
  } catch (error) {
    // Xử lý lỗi.
    next(error);
  }
};

exports.login = async (req, res, next) => {
    try {
      // Find the user by phone number
      const user = await User.findOne({ phone: req.body.phone });
  
      if (!user) {
        return next(createError(404, 'User not found'));
      }
  
      // Check if the provided password is correct
      const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
  
      if (!isPasswordCorrect) {
        return next(createError(400, 'Wrong Password or username'));
      }
  
      // Create a JWT token
      const token = jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
      }, process.env.JWT_SECRET_KEY);
  
      // Omit sensitive information from the user object
      const { password, isAdmin, ...otherDetails } = user._doc;
  
      // Send the token as a cookie and user details in the response
      res.cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        details: { ...otherDetails },
        isAdmin,
        access_token: token,
      });
    } catch (error) {
      next(error);
    }
  };

