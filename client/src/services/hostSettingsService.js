export function validateQuestions(questions){
    if (!Array.isArray(questions) || questions.length !== 15) {
      return { valid: false, error: "Файл должен содержать ровно 15 вопросов." };
    }
    
    const difficultiesCount = { easy: 0, medium: 0, hard: 0 };
  
    const valid = questions.every(q => {
      if (!q.question || !q.options || !q.correct || !q.difficulty) {
        return false;
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return false;
      }

      if (!["easy", "medium", "hard"].includes(q.difficulty)) {
        return false;
      }

      if (!q.options.includes(q.correct)) {
        return false;
      }

      difficultiesCount[q.difficulty] += 1;
      return true;
    });
  
    if (!valid) {
      return { valid: false, error: "Один или несколько вопросов имеют неверный формат. Проверьте, что присутствуют поля question, options, correct и difficulty, а options – массив из 4 элементов." };
    }
    
    if (difficultiesCount.easy !== 5 || difficultiesCount.medium !== 5 || difficultiesCount.hard !== 5) {
      return { valid: false, error: "Файл должен содержать 5 вопросов каждой категории: easy, medium, hard." };
    }
    
    return { valid: true };
  };

  export function shuffleQuestions(questions) {
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

    return chosenQuestions;
  };