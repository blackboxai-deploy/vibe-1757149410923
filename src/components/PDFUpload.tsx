'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizData } from '@/types/game';

interface PDFUploadProps {
  onQuizGenerated: (quizData: QuizData) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function PDFUpload({ onQuizGenerated, isProcessing, setIsProcessing }: PDFUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      setUploadedFile(files[0]);
    }
  };

  const handleProcessPDF = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('🍄 Mario is preparing your PDF...');

    try {
      // Simulate processing stages with progress updates
      const stages = [
        { message: '📖 Reading your PDF document...', progress: 20 },
        { message: '🤖 AI is analyzing the content...', progress: 40 },
        { message: '❓ Generating Super Mario quiz questions...', progress: 60 },
        { message: '⚡ Adding power-ups and special effects...', progress: 80 },
        { message: '🎮 Preparing your quiz adventure...', progress: 100 }
      ];

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i].message);
        setProgress(stages[i].progress);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      }

      // Convert PDF to base64 for AI processing
      const base64PDF = await convertFileToBase64(uploadedFile);
      
      // Call our API to process the PDF and generate quiz
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uploadedFile.name,
          fileData: base64PDF,
          fileSize: uploadedFile.size
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.quizData) {
        setProcessingStage('🎉 Quiz ready! Let\'s-a go!');
        
        // Small delay for final message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onQuizGenerated(result.quizData);
      } else {
        throw new Error(result.error || 'Failed to generate quiz');
      }

    } catch (error) {
      console.error('PDF processing error:', error);
      setProcessingStage(`❌ Oops! ${error instanceof Error ? error.message : 'Something went wrong. Please try again!'}`);
      setProgress(0);
      
      // Reset after showing error
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStage('');
      }, 3000);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix to get just the base64 data
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="space-y-6">
      {!isProcessing && (
        <>
          {/* File Upload Area */}
          <Card 
            className={`
              border-4 border-dashed transition-all duration-300 cursor-pointer
              ${dragOver 
                ? 'border-green-400 bg-green-50 scale-105' 
                : 'border-blue-300 bg-white/90 hover:bg-white hover:border-blue-400 hover:scale-102'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-12 text-center space-y-6">
              <div className="text-6xl animate-bounce">
                {dragOver ? '🎯' : '📁'}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-700">
                  {dragOver ? 'Drop it like it\'s hot! 🔥' : 'Drag & Drop Your PDF'}
                </h3>
                <p className="text-gray-600">
                  Or click here to browse files
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF files up to 10MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Selected File Display */}
          {uploadedFile && (
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-300">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  ✅ File Selected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-700">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="text-4xl animate-pulse">📄</div>
                </div>

                <Button
                  onClick={handleProcessPDF}
                  className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-3 rounded-full shadow-lg transform transition-all hover:scale-105 hover:shadow-xl border-2 border-red-300"
                  disabled={isProcessing}
                >
                  🚀 Generate Mario Quiz!
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Processing Display */}
      {isProcessing && (
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-600 text-xl text-center">
              🎮 Creating Your Quiz Adventure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mario Running Animation */}
            <div className="flex justify-center items-center space-y-4">
              <div className="text-6xl animate-bounce">
                🏃‍♂️
              </div>
            </div>

            {/* Processing Stage */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                {processingStage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-3" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Fun Mario Facts during processing */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p className="text-sm text-blue-700 italic text-center">
                🍄 Fun Fact: Mario has appeared in over 200 video games since 1981!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Tips */}
      {!uploadedFile && !isProcessing && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              💡 Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-lg">📚</span>
              <span>Educational PDFs work best (textbooks, articles, guides)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📝</span>
              <span>Text-based PDFs generate better questions than image-heavy ones</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🎯</span>
              <span>10-50 page documents create the most balanced quiz experience</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">⚡</span>
              <span>Processing time: ~30-60 seconds depending on document length</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}