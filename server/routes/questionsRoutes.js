const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();


router.get("/", (req, res) => {
    const filePath = path.join(__dirname, "../data/questions.json");
    
    fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
            res.status(500).send("An error occured while reading questions");
        }

        let questions = JSON.parse(data);

        const easyQuestions = questions.filter(q => q.difficulty === "easy");
        const mediumQuestions = questions.filter(q => q.difficulty === "medium");
        const hardQuestions = questions.filter(q => q.difficulty === "hard");

        let chosenQuestions = [];

        for (let i = 1; i <= 15; i++) {
            if (i <= 5) {
                chosenQuestions.push(easyQuestions.splice(Math.floor(Math.random() * easyQuestions.length), 1)[0]);
            } else if (i <= 10) {
                chosenQuestions.push(mediumQuestions.splice(Math.floor(Math.random() * mediumQuestions.length), 1)[0]);
            } else {
                chosenQuestions.push(hardQuestions.splice(Math.floor(Math.random() * hardQuestions.length), 1)[0]);
            }
        }

        res.json(chosenQuestions);
    });
});

module.exports = router;
