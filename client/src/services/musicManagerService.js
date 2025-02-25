import mainPageBackground from "../audio/main_page_background.mp3";
import firstQuestion from "../audio/first_question_cut.mp3";
import easyBackground from "../audio/easy_questions.mp3";
import easyCorrect from "../audio/easy_correct.mp3";
import easyWrong from "../audio/easy_incorrect.mp3";    
import mediumBackground from "../audio/medium_questions.mp3";
import hardBackground from "../audio/hard_questions.mp3";
import pause from "../audio/pause.mp3";
import mediumAndHardCorrect from "../audio/medium_correct.mp3";
import mediumAndHardWrong from "../audio/medium_incorrect.mp3";
import levelTransition from "../audio/next_hard_question.mp3";
import tenthQuestionCorrect from "../audio/10_question_correct.mp3";
import fifteenthQuestionBackground from "../audio/15_question.mp3";
import fifteenthQuestionCorrect from "../audio/15_question_correct.mp3";
import fifteenthQuestionWrong from "../audio/15_question_incorrect.mp3";


let backgroundAudio = null;
let currentDifficulty = null;
let currentVolume = 0.5;

function playAudio(src, options = {}) {
  const audio = new Audio(src);
  audio.loop = options.loop || false;
  audio.volume = currentVolume;
  audio.play().catch((err) => {
    if (err.name === "AbortError") {
      return;
    }
    console.error("Audio play error:", err);
  });
  return audio;
}


export function playBackgroundMusic(difficulty, questionNumber) {
  if (backgroundAudio && currentDifficulty === difficulty) {
    return;
  }
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = null;
  }
  
  let tune;
  if (difficulty === "easy") {
    tune = easyBackground;
  } else if (difficulty === "medium") {
    tune = mediumBackground;
  } else if (difficulty === "hard" && questionNumber !== 14) {
    tune = hardBackground;
  } else if (difficulty === "hard" && questionNumber === 14) {
    tune = fifteenthQuestionBackground;
  }

  if (tune) {
    backgroundAudio = playAudio(tune, { loop: true });
    currentDifficulty = difficulty;
  }
}

export function stopBackgroundMusic() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = null;
  }
}

export function setGlobalVolume(vol) {
  currentVolume = vol;
  if (backgroundAudio) {
    backgroundAudio.volume = currentVolume;
  }
}

export function playSoundEffect(src) {
  playAudio(src);
}

export function playFeedbackSound(result, difficulty, questionNumber) {
  let tune;
  if (result === "correct" && difficulty === "easy") {    
    tune = easyCorrect;
  } else if (result === "wrong" && difficulty === "easy") {
    tune = easyWrong;
  } else if (result === "correct" && (difficulty === "medium" || difficulty === "hard")) {
    if (questionNumber === 9) {
      tune = tenthQuestionCorrect;
    } else if (questionNumber === 14) {
      tune = fifteenthQuestionCorrect;
    } else {
      tune = mediumAndHardCorrect;
    }
  } else if (result === "wrong" && (difficulty === "medium" || difficulty === "hard")) {
    if (questionNumber === 14) {
      tune = fifteenthQuestionWrong;
    } else {
      tune = mediumAndHardWrong;
    }
  }
  
  if (tune) {
    playSoundEffect(tune);
  }
}

export function playStartTune() {
  playSoundEffect(firstQuestion);
}

export function playLevelTransition() {
  playSoundEffect(levelTransition);
}

export function playPauseTune() {
  playSoundEffect(pause);
}

export function playMainPageBackground() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = null;
  }
  backgroundAudio = playAudio(mainPageBackground, { loop: true });
}
