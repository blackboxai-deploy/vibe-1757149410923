import { NextRequest, NextResponse } from 'next/server';
import { QuizData, QuizQuestion } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileData, fileSize } = body;

    // Validate input
    if (!fileName || !fileData || !fileSize) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fileName, fileData, or fileSize' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (fileSize > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${fileName} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

    // Call AI to extract text and generate quiz
    const aiResponse = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'gargijain184@gmail.com',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a Super Mario-themed quiz generator! 🍄

Please analyze the PDF document and create an exciting Mario-style quiz with 12-15 questions. Follow these guidelines:

1. **Extract Key Content**: Read through the entire PDF and identify the most important concepts, facts, and information.

2. **Question Types**: Create a variety of question types:
   - Factual recall questions
   - Conceptual understanding questions  
   - Application-based questions
   - Analysis questions

3. **Mario Theme Integration**: Where appropriate, add light Mario-themed elements to questions (but keep the core educational content intact):
   - "Just like Mario collecting coins, which of the following..."
   - "Mario would jump for joy knowing that..."
   - "Power up your knowledge! Which statement is correct?"

4. **Difficulty Progression**:
   - Questions 1-4: Easy (100 points each)
   - Questions 5-8: Medium (200 points each)  
   - Questions 9-12: Hard (400 points each)
   - Questions 13+: Boss level (800 points each)

5. **Format**: Return ONLY a JSON object with this exact structure:
{
  "title": "Quiz title based on PDF content",
  "description": "Brief description of the quiz topic",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "points": 100,
      "explanation": "Brief explanation of the correct answer",
      "marioTheme": "Optional Mario-themed context if applicable"
    }
  ]
}

Make sure questions are educational, accurate, and engaging. Test comprehension at multiple levels from basic recall to critical thinking.`
              },
              {
                type: 'file',
                file: {
                  filename: fileName,
                  file_data: `data:application/pdf;base64,${fileData}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: `AI processing failed: ${aiResponse.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const aiResult = await aiResponse.json();
    
    if (!aiResult.choices || aiResult.choices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No response from AI service' },
        { status: 500 }
      );
    }

    const aiContent = aiResult.choices[0].message.content;
    
    // Parse the AI response as JSON
    let quizData: QuizData;
    try {
      const parsedContent = JSON.parse(aiContent);
      
      // Validate the structure
      if (!parsedContent.title || !parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        throw new Error('Invalid quiz structure from AI');
      }

      // Ensure each question has required fields and assign points based on difficulty
      const validatedQuestions: QuizQuestion[] = parsedContent.questions.map((q: any, index: number) => {
        const difficulty = index < 4 ? 'easy' : index < 8 ? 'medium' : index < 12 ? 'hard' : 'boss';
        const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : difficulty === 'hard' ? 400 : 800;
        
        return {
          id: q.id || `q${index + 1}`,
          question: q.question || 'Missing question',
          options: Array.isArray(q.options) ? q.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'boss',
          points: points,
          explanation: q.explanation || '',
          marioTheme: q.marioTheme || ''
        };
      });

      quizData = {
        title: parsedContent.title || 'Super Mario PDF Quiz',
        description: parsedContent.description || 'An exciting quiz generated from your PDF!',
        questions: validatedQuestions,
        sourceDocument: fileName,
        generatedAt: new Date()
      };

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI Response:', aiContent);
      
      return NextResponse.json(
        { success: false, error: 'Failed to parse quiz data from AI response' },
        { status: 500 }
      );
    }

    // Ensure we have at least some questions
    if (quizData.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions were generated from the PDF' },
        { status: 500 }
      );
    }

    console.log(`Successfully generated quiz with ${quizData.questions.length} questions`);

    return NextResponse.json({
      success: true,
      quizData: quizData
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { success: false, error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}