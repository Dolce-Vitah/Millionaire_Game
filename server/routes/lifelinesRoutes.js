const { useLifeline } = require("../services/lifelinesService");
const express = require("express");
const router = express.Router();


router.post("/:lifeline", (req, res) => {
    const { gameId } = req.body;
    const type = req.params.lifeline;

    const result = useLifeline(gameId, type);

    res.json(result);
});

module.exports = router;
