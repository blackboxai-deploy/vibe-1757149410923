// Game Types for Super Mario PDF Quiz Game

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  points: number;
  explanation?: string;
  marioTheme?: string; // Optional Mario-themed context
}

export interface PowerUp {
  id: string;
  type: 'fire-flower' | 'star-power' | '1up-mushroom' | 'super-mushroom';
  name: string;
  description: string;
  duration?: number; // in seconds, if applicable
  effect: PowerUpEffect;
  icon: string;
}

export interface PowerUpEffect {
  doublePoints?: boolean;
  immuneToWrongAnswers?: boolean;
  extraLife?: boolean;
  extendedTime?: boolean;
  multiplier?: number;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  lives: number;
  timeRemaining: number;
  activePowerUps: ActivePowerUp[];
  consecutiveCorrect: number;
  totalQuestions: number;
  isGameOver: boolean;
  isGameWon: boolean;
  highScore: number;
}

export interface ActivePowerUp {
  powerUp: PowerUp;
  remainingTime?: number;
  remainingUses?: number;
}

export interface GameConfig {
  initialLives: number;
  questionTimeLimit: number;
  pointsProgression: number[];
  powerUpChance: number; // percentage chance of getting power-up
  difficultyThresholds: {
    easy: number;
    medium: number;
    hard: number;
    boss: number;
  };
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
  sourceDocument: string;
  generatedAt: Date;
}

export interface PDFProcessingResult {
  success: boolean;
  extractedText?: string;
  error?: string;
  quizData?: QuizData;
}

export interface GameSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  finalScore: number;
  questionsAnswered: number;
  powerUpsUsed: string[];
  difficulty: string;
  pdfSource: string;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  date: Date;
  questionsAnswered: number;
  difficulty: string;
  powerUpsUsed: number;
}

// Sound effect types for Mario theme
export interface SoundEffect {
  id: string;
  name: string;
  src: string;
  volume: number;
}

// Animation types for visual effects
export interface Animation {
  type: 'coin-collect' | 'power-up' | 'correct-answer' | 'wrong-answer' | 'level-up';
  duration: number;
  element?: HTMLElement;
}

export interface MarioTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}