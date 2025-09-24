
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, lang } = JSON.parse(req.body);

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

  const systemPrompt = lang === 'ko'
    ? '당신은 MOSB 출입 절차, 위치, Gate Pass, 서류 요건, 안전 규정에 대해만 답변하는 도우미입니다.'
    : 'You are a helpful assistant for MOSB gate entry procedures, documents, safety and location.';

  const payload = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ],
    temperature: 0.3,
  };

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!completion.ok) {
      throw new Error(`OpenAI API error: ${completion.status}`);
    }

    const result = await completion.json();
    const reply = result.choices?.[0]?.message?.content ?? "답변 생성 실패.";
    
    res.status(200).json({ answer: reply });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
