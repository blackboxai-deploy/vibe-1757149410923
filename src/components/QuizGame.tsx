'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuizData, GameState } from '@/types/game';
import { 
  DEFAULT_GAME_CONFIG, 
  calculatePoints, 
  shouldGetPowerUp, 
  getRandomPowerUp,
  updateActivePowerUps,
  applyPowerUpEffect,
  getQuestionDifficulty,
  getMarioEncouragement,
  formatTime,
  saveHighScore,
  getHighScore
} from '@/lib/gameUtils';

interface QuizGameProps {
  quizData: QuizData;
  onGameEnd: () => void;
}

export default function QuizGame({ quizData, onGameEnd }: QuizGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    lives: DEFAULT_GAME_CONFIG.initialLives,
    timeRemaining: DEFAULT_GAME_CONFIG.questionTimeLimit,
    activePowerUps: [],
    consecutiveCorrect: 0,
    totalQuestions: quizData.questions.length,
    isGameOver: false,
    isGameWon: false,
    highScore: getHighScore()
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedPowerUp, setEarnedPowerUp] = useState<string | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const currentQuestion = quizData.questions[gameState.currentQuestionIndex];
  const currentDifficulty = getQuestionDifficulty(gameState.currentQuestionIndex);

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || showResult) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        
        // Update active power-ups
        const updatedPowerUps = updateActivePowerUps(prev.activePowerUps, 1);
        
        if (newTime <= 0) {
          // Time up - treat as wrong answer
          return {
            ...prev,
            timeRemaining: 0,
            lives: prev.lives - 1,
            consecutiveCorrect: 0,
            activePowerUps: updatedPowerUps,
            isGameOver: prev.lives <= 1
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTime,
          activePowerUps: updatedPowerUps
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameOver, showResult]);

  // Handle time up
  useEffect(() => {
    if (gameState.timeRemaining === 0 && !showResult) {
      handleTimeUp();
    }
  }, [gameState.timeRemaining, showResult]);

  const handleTimeUp = () => {
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowResult(true);
    setEncouragementMessage('Time\'s up! Don\'t worry, Mario believes in you!');
    setPointsEarned(0);
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || gameState.isGameOver) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Calculate points
    const timeBonus = gameState.timeRemaining;
    const points = correct ? calculatePoints(currentQuestion, gameState.consecutiveCorrect, gameState.activePowerUps, timeBonus) : 0;
    setPointsEarned(points);

    // Check for power-up
    let newPowerUp: string | null = null;
    if (correct && shouldGetPowerUp(gameState.consecutiveCorrect, currentDifficulty)) {
      const powerUp = getRandomPowerUp();
      newPowerUp = powerUp.name;
      setEarnedPowerUp(powerUp.name);
    }

    // Update game state
    setGameState(prev => {
      let newState = { ...prev };
      
      if (correct) {
        newState.score += points;
        newState.consecutiveCorrect += 1;
        
        // Apply power-up if earned
        if (newPowerUp) {
          const powerUp = getRandomPowerUp();
          newState = applyPowerUpEffect(newState, powerUp);
        }
        
        // Update remaining uses for double-points power-ups
        newState.activePowerUps = newState.activePowerUps.map(activePowerUp => ({
          ...activePowerUp,
          remainingUses: activePowerUp.powerUp.effect.doublePoints ? 
            Math.max(0, (activePowerUp.remainingUses || 3) - 1) : activePowerUp.remainingUses
        }));
      } else {
        // Check if immune to wrong answers (Star Power)
        const hasStarPower = prev.activePowerUps.some(p => p.powerUp.type === 'star-power');
        
        if (!hasStarPower) {
          newState.lives -= 1;
          newState.consecutiveCorrect = 0;
        }
      }
      
      return newState;
    });

    // Set encouragement message
    if (correct) {
      setEncouragementMessage(getMarioEncouragement(gameState.consecutiveCorrect));
    } else {
      const hasStarPower = gameState.activePowerUps.some(p => p.powerUp.type === 'star-power');
      if (hasStarPower) {
        setEncouragementMessage('Star Power saved you! ⭐');
      } else {
        setEncouragementMessage('Oops! Better luck next time, Mario!');
      }
    }

    // Auto-advance after delay
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = useCallback(() => {
    setShowResult(false);
    setSelectedAnswer(null);
    setEarnedPowerUp(null);
    setEncouragementMessage('');
    setPointsEarned(0);

    setGameState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isLastQuestion = nextIndex >= prev.totalQuestions;
      const isDead = prev.lives <= 0;

      return {
        ...prev,
        currentQuestionIndex: isLastQuestion ? prev.currentQuestionIndex : nextIndex,
        timeRemaining: DEFAULT_GAME_CONFIG.questionTimeLimit,
        isGameOver: isDead || isLastQuestion,
        isGameWon: isLastQuestion && !isDead
      };
    });
  }, []);

  const handleGameEnd = () => {
    // Save high score
    const isNewHighScore = saveHighScore(gameState.score);
    
    if (isNewHighScore) {
      alert('🎉 NEW HIGH SCORE! 🎉\nCongratulations, you\'re the new Super Mario Quiz Champion!');
    }

    onGameEnd();
  };

  const getTimeColor = () => {
    if (gameState.timeRemaining > 20) return 'text-green-600';
    if (gameState.timeRemaining > 10) return 'text-yellow-600';
    return 'text-red-600';
  };



  if (gameState.isGameOver) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-4 border-blue-300">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl mb-4">
            {gameState.isGameWon ? '🏆 Victory!' : '💔 Game Over'}
          </CardTitle>
          <div className="text-6xl animate-bounce mb-4">
            {gameState.isGameWon ? '🎉' : '😢'}
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-yellow-600">
              Final Score: {gameState.score.toLocaleString()}
            </p>
            <p className="text-lg text-gray-600">
              Questions Answered: {gameState.currentQuestionIndex} / {gameState.totalQuestions}
            </p>
            {gameState.score > gameState.highScore && (
              <p className="text-xl text-green-600 font-bold animate-pulse">
                🎉 NEW HIGH SCORE! 🎉
              </p>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <p className="text-blue-700 font-medium">
              {gameState.isGameWon 
                ? 'Mamma mia! You completed the quiz like a true Super Mario champion!' 
                : 'Don\'t worry! Even Mario needs a few tries to beat Bowser. Try again!'}
            </p>
          </div>

          <Button
            onClick={handleGameEnd}
            className="bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
          >
            🏠 Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">
                Question {gameState.currentQuestionIndex + 1} / {gameState.totalQuestions}
              </div>
              <Badge variant="outline" className={`
                ${currentDifficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-300' :
                  currentDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                  currentDifficulty === 'hard' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                  'bg-red-100 text-red-700 border-red-300'}
              `}>
                {currentDifficulty.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-xl font-bold text-yellow-600">🪙 {gameState.score.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Lives</div>
                <div className="text-xl">
                  {'❤️'.repeat(gameState.lives)}
                  {'🖤'.repeat(3 - gameState.lives)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Power-ups */}
      {gameState.activePowerUps.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-yellow-700">Active Power-ups:</span>
              <div className="flex gap-2">
                {gameState.activePowerUps.map((activePowerUp, index) => (
                  <Badge key={index} className="bg-yellow-500 text-white animate-pulse">
                    {activePowerUp.powerUp.icon} {activePowerUp.powerUp.name}
                    {activePowerUp.remainingTime && ` (${activePowerUp.remainingTime}s)`}
                    {activePowerUp.remainingUses && ` (${activePowerUp.remainingUses} uses)`}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-300">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Time Remaining</span>
            <span className={`text-lg font-bold ${getTimeColor()}`}>
              {formatTime(gameState.timeRemaining)}
            </span>
          </div>
          <Progress 
            value={(gameState.timeRemaining / DEFAULT_GAME_CONFIG.questionTimeLimit) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-300">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`
                w-full text-left p-4 h-auto transition-all text-wrap
                ${selectedAnswer === index 
                  ? (isCorrect 
                    ? 'bg-green-500 text-white border-green-600' 
                    : 'bg-red-500 text-white border-red-600')
                  : showResult && index === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }
                ${!showResult ? 'hover:scale-102 hover:shadow-md' : ''}
              `}
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Result Display */}
      {showResult && (
        <Card className={`
          border-4 transition-all animate-pulse
          ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}
        `}>
          <CardContent className="py-6 text-center space-y-4">
            <div className="text-6xl animate-bounce">
              {isCorrect ? '🎉' : '😔'}
            </div>
            
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct!' : 'Wrong Answer'}
              </h3>
              
              <p className="text-lg text-gray-700">
                {encouragementMessage}
              </p>

              {pointsEarned > 0 && (
                <p className="text-xl font-bold text-yellow-600">
                  +{pointsEarned.toLocaleString()} points! 🪙
                </p>
              )}

              {earnedPowerUp && (
                <div className="bg-yellow-100 rounded-lg p-3 border-2 border-yellow-300">
                  <p className="text-yellow-700 font-bold animate-pulse">
                    🎁 Power-up Earned: {earnedPowerUp}!
                  </p>
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400 text-left">
                  <p className="text-sm text-blue-700">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}