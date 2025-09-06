'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PDFUpload from '@/components/PDFUpload';
import QuizGame from '@/components/QuizGame';
import { QuizData } from '@/types/game';
import { getHighScore } from '@/lib/gameUtils';

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'game'>('home');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const highScore = getHighScore();

  const handleQuizGenerated = (data: QuizData) => {
    setQuizData(data);
    setCurrentView('game');
  };

  const handleBackHome = () => {
    setCurrentView('home');
    setQuizData(null);
  };

  const handleStartUpload = () => {
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Mario-style background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-16 h-16 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-red-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-green-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-400 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {currentView === 'home' && (
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
                🍄 Super Mario 
                <br />
                <span className="text-yellow-300">PDF Quiz Game</span>
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
                Transform any PDF into an exciting Super Mario-style quiz adventure! 
                Collect coins, power-ups, and challenge yourself with AI-generated questions.
              </p>
            </div>

            {/* Game Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-300 hover:border-red-400 transition-all hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-red-600 text-lg">🔥 Fire Flower</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-700">
                  Double points for correct answers!
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-300 hover:border-yellow-400 transition-all hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-yellow-600 text-lg">⭐ Star Power</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-700">
                  Immunity to wrong answers!
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-300 hover:border-green-400 transition-all hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-green-600 text-lg">🍄 1UP Mushroom</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-700">
                  Gain an extra life!
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-300 hover:border-purple-400 transition-all hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-purple-600 text-lg">🍄 Super Mushroom</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-700">
                  Extended time for questions!
                </CardContent>
              </Card>
            </div>

            {/* Game Stats */}
            {highScore > 0 && (
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-gold max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-yellow-600 text-2xl flex items-center justify-center gap-2">
                    🏆 High Score: {highScore.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Start Game Button */}
            <div className="space-y-4">
              <Button
                onClick={handleStartUpload}
                className="bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transform transition-all hover:scale-110 hover:shadow-xl border-4 border-red-300"
              >
                🚀 Start Quiz Adventure!
              </Button>
              
              <div className="text-blue-100 text-sm">
                Upload a PDF and let the magic begin! 🎮
              </div>
            </div>

            {/* How to Play */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-300 max-w-2xl mx-auto text-left">
              <CardHeader>
                <CardTitle className="text-blue-600 text-xl text-center">🎮 How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📁</span>
                  <span>Upload any PDF document</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🤖</span>
                  <span>AI generates quiz questions from your PDF</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">❓</span>
                  <span>Answer questions to earn coins and points</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <span>Collect power-ups for special abilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏆</span>
                  <span>Beat your high score and become the quiz champion!</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Button
                onClick={handleBackHome}
                variant="outline"
                className="mb-4 bg-white/90 hover:bg-white border-2 border-blue-300"
              >
                ← Back to Home
              </Button>
              <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
                📁 Upload Your PDF
              </h2>
              <p className="text-blue-100 text-lg">
                Choose a PDF document to transform into an exciting quiz adventure!
              </p>
            </div>

            <PDFUpload
              onQuizGenerated={handleQuizGenerated}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        )}

        {currentView === 'game' && quizData && (
          <div className="max-w-6xl mx-auto">
            <QuizGame
              quizData={quizData}
              onGameEnd={handleBackHome}
            />
          </div>
        )}
      </div>

      {/* Floating Mario elements */}
      <div className="fixed bottom-4 left-4 text-4xl animate-bounce opacity-70 pointer-events-none">
        🍄
      </div>
      <div className="fixed top-4 right-4 text-3xl animate-pulse opacity-70 pointer-events-none">
        ⭐
      </div>
      <div className="fixed bottom-4 right-4 text-3xl animate-bounce delay-1000 opacity-70 pointer-events-none">
        🪙
      </div>
    </div>
  );
}