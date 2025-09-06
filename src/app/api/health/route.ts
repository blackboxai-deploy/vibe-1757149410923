import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'Super Mario PDF Quiz Game API is running! 🍄', 
    timestamp: new Date().toISOString(),
    features: {
      pdfUpload: true,
      aiQuizGeneration: true,
      marioThemeEngine: true,
      powerUpSystem: true
    }
  });
}