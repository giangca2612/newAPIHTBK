const express = require('express');
const router = express.Router();

const { createBill, deleteBill, getAllBills, getBillById } = require("../controllers/bill");

router.post('/create/bill', createBill);
router.delete('/delete', deleteBill);
router.get('/getall', getAllBills);
router.get('/getbillbyid/:id', getBillById);

module.exports = router;