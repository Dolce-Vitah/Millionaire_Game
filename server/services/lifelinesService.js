const { getGame, updateGameState } = require("./gameService");

function generateVotes(question) {
    const difficulty = question.difficulty;
    const options = question.options;
    const correctAnswer = question.correct;

    let audienceVotes = options.map(option => ({
        option,
        percentage: 0 
    }));

    let confidenceRange;
    switch (difficulty) {
        case "easy": {
            confidenceRange = [70, 90];
            break;
        }

        case "medium": {
            confidenceRange = [50, 70];
            break;
        }

        case "hard": {
            confidenceRange = [30, 50];
            break;
        }
    }

    const confidenceLevel = Math.floor(
        Math.random() * (confidenceRange[1] - confidenceRange[0] + 1) + confidenceRange[0]
    );

    let remainingVotes = 100;
    const correctAnswerVotes = Math.floor(
        (Math.random() * (confidenceLevel - confidenceRange[0]) + confidenceRange[0])
    );

    audienceVotes.find(vote => vote.option === correctAnswer).percentage = correctAnswerVotes;
    remainingVotes -= correctAnswerVotes;

    const incorrectOptions = audienceVotes.filter(vote => vote.option !== correctAnswer && vote.option);
    incorrectOptions.forEach((vote, index) => {
    if (index === incorrectOptions.length - 1) {
      vote.percentage = remainingVotes; 
    } else {
      const randomPercentage = Math.floor(Math.random() * remainingVotes);
      vote.percentage = randomPercentage;
      remainingVotes -= randomPercentage;
    }
    });

    return audienceVotes;
}

const useLifeline = (gameId, type, format) => {
    const game = getGame(gameId);

    const currentQuestionIndex = game.currentQuestion;
    const question = game.questions[currentQuestionIndex];

    if (format === "high-risk" && type === "double-dip") {
        return { message: "In case you are wrong, your second attempt might be the lucky one." };
    }

    game.usedLifelines[type] = true;
    updateGameState(gameId, game);

    switch (type) {
        case "fifty-fifty": {
            const correctOption = question.correct;
            const incorrectOptions = question.options.filter(ans => ans !== correctOption);
            const extraOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
            const finalOptions = question.options.map((option) => 
                (option !== correctOption ? (option !== extraOption ? null : extraOption) : correctOption));

            game.questions[currentQuestionIndex].options = finalOptions;
            updateGameState(gameId, game);

            return { options: finalOptions };
        }

        case "ask-audience": {
            const audienceVotes = generateVotes(question);
            return { audienceVotes };
        }

        case "phone-friend": {
            const votes = generateVotes(question);
            const finalAnswer = votes.reduce(
                (acc, obj) => (acc.percentage > obj.percentage ? acc : obj),
                votes[0].percentage
            );
            return { guess: String.fromCharCode(65 + votes.indexOf(finalAnswer)) };
        }
    }
}

module.exports = { useLifeline };