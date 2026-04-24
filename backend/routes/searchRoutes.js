const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { globalSearch } = require("../controllers/searchController");

const router = express.Router();

router.use(protect);

router.get("/", globalSearch);

module.exports = router;
