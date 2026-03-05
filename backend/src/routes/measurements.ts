import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "../env";

const measurementsRouter = new Hono();

const analyzeSchema = z.object({
  imageBase64: z.string().min(1), // base64 data URL: "data:image/jpeg;base64,..."
  heightCm: z.number().min(50).max(300),
});

measurementsRouter.post("/analyze", zValidator("json", analyzeSchema), async (c) => {
  const { imageBase64, heightCm } = c.req.valid("json");

  const prompt = `You are a precise body measurement estimation system. The user is ${heightCm}cm tall.

Analyze this full-body photo and estimate the following measurements in centimeters.
Use the provided height (${heightCm}cm) as your reference scale to calculate all other measurements proportionally.

Return ONLY a valid JSON object with this exact structure, no explanation:
{
  "chest": <number>,
  "waist": <number>,
  "hips": <number>,
  "shoulder": <number>,
  "inseam": <number>,
  "confidence": <"high"|"medium"|"low">,
  "notes": <string, max 100 chars, brief observation about the body type or fit tips>
}

Rules:
- All measurements must be realistic for a human body
- chest: circumference around fullest part of chest
- waist: circumference around narrowest torso
- hips: circumference around fullest hip/seat
- shoulder: width from shoulder tip to shoulder tip
- inseam: from crotch to ankle
- confidence: "high" if full body clearly visible, "medium" if partial, "low" if unclear
- If you cannot see the body clearly, use the height to estimate proportional averages
- Always return valid numbers, never null`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenAI error:", response.status, err);
    return c.json({ error: { message: "AI analysis failed", code: "AI_ERROR" } }, 500);
  }

  const result = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = result.choices?.[0]?.message?.content ?? "";

  // Extract JSON from the response (may be wrapped in markdown code block)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return c.json({ error: { message: "Could not parse AI response", code: "PARSE_ERROR" } }, 500);
  }

  try {
    const measurements = JSON.parse(jsonMatch[0]) as {
      chest: number;
      waist: number;
      hips: number;
      shoulder: number;
      inseam: number;
      confidence: string;
      notes: string;
    };

    return c.json({
      data: {
        chest: Math.round(measurements.chest * 10) / 10,
        waist: Math.round(measurements.waist * 10) / 10,
        hips: Math.round(measurements.hips * 10) / 10,
        shoulder: Math.round(measurements.shoulder * 10) / 10,
        inseam: Math.round(measurements.inseam * 10) / 10,
        confidence: measurements.confidence,
        notes: measurements.notes,
      },
    });
  } catch {
    return c.json({ error: { message: "Invalid AI response format", code: "PARSE_ERROR" } }, 500);
  }
});

export { measurementsRouter };
