const router = require("express").Router();

const { register, login, loginmail} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/loginmail",loginmail); 

// Export router dưới dạng một hàm middleware
module.exports = router;

// controllers/auth.js
// ...
