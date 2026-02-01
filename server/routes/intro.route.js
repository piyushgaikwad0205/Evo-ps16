const router = require("express").Router();
const { chatPublic } = require("../controllers/intro.controller");

router.post("/chat", chatPublic);

module.exports = router;

