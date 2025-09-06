// Mario Game Utilities and Logic

import { GameConfig, PowerUp, QuizQuestion, GameState, ActivePowerUp } from '@/types/game';

// Default game configuration
export const DEFAULT_GAME_CONFIG: GameConfig = {
  initialLives: 3,
  questionTimeLimit: 30, // seconds
  pointsProgression: [100, 200, 400, 800, 1600], // Mario-style progression
  powerUpChance: 15, // 15% chance
  difficultyThresholds: {
    easy: 0,    // Questions 0-3
    medium: 4,  // Questions 4-7
    hard: 8,    // Questions 8-11
    boss: 12    // Questions 12+
  }
};

// Available Power-ups
export const POWER_UPS: PowerUp[] = [
  {
    id: 'fire-flower',
    type: 'fire-flower',
    name: 'Fire Flower',
    description: 'Double points for next 3 questions!',
    duration: 0, // uses remaining questions
    effect: { doublePoints: true, multiplier: 2 },
    icon: '🌸'
  },
  {
    id: 'star-power',
    type: 'star-power',
    name: 'Star Power',
    description: 'Immunity to wrong answers for 30 seconds!',
    duration: 30,
    effect: { immuneToWrongAnswers: true },
    icon: '⭐'
  },
  {
    id: '1up-mushroom',
    type: '1up-mushroom',
    name: '1UP Mushroom',
    description: 'Gain an extra life!',
    effect: { extraLife: true },
    icon: '🍄'
  },
  {
    id: 'super-mushroom',
    type: 'super-mushroom',
    name: 'Super Mushroom',
    description: 'Extended time limit for questions!',
    duration: 60,
    effect: { extendedTime: true, multiplier: 1.5 },
    icon: '🍄'
  }
];

// Calculate points for a correct answer
export const calculatePoints = (
  question: QuizQuestion,
  consecutiveCorrect: number,
  activePowerUps: ActivePowerUp[],
  timeBonus: number = 0
): number => {
  let basePoints = question.points;
  
  // Consecutive answer bonus (Mario-style)
  const consecutiveBonus = Math.min(consecutiveCorrect * 50, 500);
  
  // Time bonus (faster answers get more points)
  const timeBonusPoints = Math.floor(timeBonus * 10);
  
  // Power-up multipliers
  let multiplier = 1;
  activePowerUps.forEach(activePowerUp => {
    if (activePowerUp.powerUp.effect.doublePoints) {
      multiplier *= 2;
    }
    if (activePowerUp.powerUp.effect.multiplier) {
      multiplier *= activePowerUp.powerUp.effect.multiplier;
    }
  });
  
  return Math.floor((basePoints + consecutiveBonus + timeBonusPoints) * multiplier);
};

// Determine if player should get a power-up
export const shouldGetPowerUp = (
  consecutiveCorrect: number,
  difficulty: string,
  config: GameConfig = DEFAULT_GAME_CONFIG
): boolean => {
  let baseChance = config.powerUpChance;
  
  // Increase chance based on consecutive correct answers
  const consecutiveBonus = Math.min(consecutiveCorrect * 5, 25);
  
  // Increase chance for harder questions
  const difficultyBonus = difficulty === 'hard' ? 10 : difficulty === 'boss' ? 20 : 0;
  
  const totalChance = baseChance + consecutiveBonus + difficultyBonus;
  
  return Math.random() * 100 < totalChance;
};

// Get random power-up
export const getRandomPowerUp = (): PowerUp => {
  const randomIndex = Math.floor(Math.random() * POWER_UPS.length);
  return POWER_UPS[randomIndex];
};

// Update active power-ups (remove expired ones)
export const updateActivePowerUps = (
  activePowerUps: ActivePowerUp[],
  deltaTime: number
): ActivePowerUp[] => {
  return activePowerUps
    .map(activePowerUp => ({
      ...activePowerUp,
      remainingTime: activePowerUp.remainingTime ? 
        Math.max(0, activePowerUp.remainingTime - deltaTime) : undefined,
      remainingUses: activePowerUp.remainingUses ? 
        activePowerUp.remainingUses : undefined
    }))
    .filter(activePowerUp => {
      // Remove if time expired or uses exhausted
      if (activePowerUp.remainingTime !== undefined && activePowerUp.remainingTime <= 0) {
        return false;
      }
      if (activePowerUp.remainingUses !== undefined && activePowerUp.remainingUses <= 0) {
        return false;
      }
      return true;
    });
};

// Apply power-up effect
export const applyPowerUpEffect = (
  gameState: GameState,
  powerUp: PowerUp
): GameState => {
  let newState = { ...gameState };
  
  if (powerUp.effect.extraLife) {
    newState.lives = Math.min(newState.lives + 1, 5); // Max 5 lives
  }
  
  // Add to active power-ups if it has duration or uses
  if (powerUp.duration || powerUp.effect.doublePoints) {
    const activePowerUp: ActivePowerUp = {
      powerUp,
      remainingTime: powerUp.duration,
      remainingUses: powerUp.effect.doublePoints ? 3 : undefined
    };
    
    newState.activePowerUps = [...newState.activePowerUps, activePowerUp];
  }
  
  return newState;
};

// Get difficulty based on question index
export const getQuestionDifficulty = (
  questionIndex: number,
  config: GameConfig = DEFAULT_GAME_CONFIG
): 'easy' | 'medium' | 'hard' | 'boss' => {
  if (questionIndex >= config.difficultyThresholds.boss) return 'boss';
  if (questionIndex >= config.difficultyThresholds.hard) return 'hard';
  if (questionIndex >= config.difficultyThresholds.medium) return 'medium';
  return 'easy';
};

// Generate Mario-themed encouragement messages
export const getMarioEncouragement = (consecutiveCorrect: number): string => {
  const messages = [
    "Mamma mia! Great job!",
    "Super! You're on fire!",
    "Wahoo! Keep it up!",
    "It's-a me, and you're amazing!",
    "Let's-a go! You got this!",
    "Star power activated!",
    "You're the real super star!",
    "Incredible! Just like jumping on Goombas!",
    "Power up! You're unstoppable!",
    "Fantastic! Princess Peach would be proud!"
  ];
  
  if (consecutiveCorrect >= 5) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  return messages[Math.floor(Math.random() * Math.min(messages.length, 5))];
};

// Format time display (MM:SS)
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Local storage helpers
export const saveHighScore = (score: number): boolean => {
  try {
    const highScore = localStorage.getItem('marioQuizHighScore');
    const currentHigh = highScore ? parseInt(highScore) : 0;
    
    if (score > currentHigh) {
      localStorage.setItem('marioQuizHighScore', score.toString());
      return true; // New high score!
    }
    return false;
  } catch (error) {
    console.error('Error saving high score:', error);
    return false;
  }
};

export const getHighScore = (): number => {
  try {
    const highScore = localStorage.getItem('marioQuizHighScore');
    return highScore ? parseInt(highScore) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

// Sound effect simulation (CSS class-based)
export const playSoundEffect = (type: 'coin' | 'powerup' | 'correct' | 'wrong' | 'gameover'): void => {
  // Create temporary element for sound effect animation
  const soundElement = document.createElement('div');
  soundElement.className = `sound-effect sound-${type}`;
  document.body.appendChild(soundElement);
  
  // Remove after animation
  setTimeout(() => {
    document.body.removeChild(soundElement);
  }, 1000);
};

export default {
  DEFAULT_GAME_CONFIG,
  POWER_UPS,
  calculatePoints,
  shouldGetPowerUp,
  getRandomPowerUp,
  updateActivePowerUps,
  applyPowerUpEffect,
  getQuestionDifficulty,
  getMarioEncouragement,
  formatTime,
  saveHighScore,
  getHighScore,
  playSoundEffect
};