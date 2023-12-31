const express = require('express');
const router = express.Router();

const { createBill, deleteBill, getAllBills, getBillById, deleteAllBills } = require("../controllers/bill");

router.post('/create/bill', createBill);
router.delete('/delete/:id', deleteBill);
router.get('/getall', getAllBills);
router.get('/getbillbyid/:id', getBillById);
router.delete('/bills', deleteAllBills);

module.exports = router;