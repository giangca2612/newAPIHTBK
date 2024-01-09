const express = require('express');
const router = express.Router();

const { createBill, deleteBill, getAllBills } = require("../controllers/bill");

router.post('/create/bill', createBill);
router.delete('/delete/:id', deleteBill);
router.get('/getall', getAllBills);

module.exports = router;