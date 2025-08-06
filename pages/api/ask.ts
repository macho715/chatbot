
export default async function handler(req, res) {
  const { question, lang } = JSON.parse(req.body);

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

  const result = await completion.json();
  const reply = result.choices?.[0]?.message?.content ?? "답변 생성 실패.";
  res.status(200).json({ answer: reply });
}
