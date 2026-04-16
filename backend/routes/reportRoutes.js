const express = require("express");
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { exportTasksReport, exportUsersReport } = require('../controllers/reportController');

router.get('/export/tasks', protect, admin, exportTasksReport); // Export All Tasks as Excel/PDF
router.get('/export/users', protect, admin, exportUsersReport); // Export User-Tsak Report

module.exports = router;
