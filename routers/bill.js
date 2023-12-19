const express = require('express');
const router = express.Router();

const { createBill, updateBill, deleteBill, getAllBills } = require("../controllers/bill");

router.post('/create', createBill);
router.put('/update/:id', updateBill);
router.delete('/delete/:id', deleteBill);
router.get('/getall', getAllBills);

module.exports = router;