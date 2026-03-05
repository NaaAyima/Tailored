import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "../env";

const measurementsRouter = new Hono();

const analyzeSchema = z.object({
  imageBase64: z.string().min(1),
  heightCm: z.number().min(50).max(300),
  garmentPreferences: z.object({
    sleeveLength: z.string().optional(),
    neckStyle: z.string().optional(),
    topFit: z.string().optional(),
    trouserFit: z.string().optional(),
    trouserLength: z.string().optional(),
    dressLength: z.string().optional(),
    preferredFabric: z.string().optional(),
    additionalNotes: z.string().optional(),
  }).optional(),
});

measurementsRouter.post("/analyze", zValidator("json", analyzeSchema), async (c) => {
  const { imageBase64, heightCm, garmentPreferences } = c.req.valid("json");

  // Build a preferences context string from non-"any" values
  const prefLines: string[] = [];
  if (garmentPreferences) {
    const p = garmentPreferences;
    if (p.sleeveLength && p.sleeveLength !== 'any') prefLines.push(`- Sleeve length: ${p.sleeveLength}`);
    if (p.neckStyle && p.neckStyle !== 'any') prefLines.push(`- Neck style: ${p.neckStyle}`);
    if (p.topFit && p.topFit !== 'any') prefLines.push(`- Top fit: ${p.topFit}`);
    if (p.trouserFit && p.trouserFit !== 'any') prefLines.push(`- Trouser fit: ${p.trouserFit}`);
    if (p.trouserLength && p.trouserLength !== 'any') prefLines.push(`- Trouser length: ${p.trouserLength}`);
    if (p.dressLength && p.dressLength !== 'any') prefLines.push(`- Dress/skirt length: ${p.dressLength}`);
    if (p.preferredFabric) prefLines.push(`- Preferred fabrics: ${p.preferredFabric}`);
    if (p.additionalNotes) prefLines.push(`- Additional notes: ${p.additionalNotes}`);
  }

  const prefsContext = prefLines.length > 0
    ? `\n\nThe user has the following garment preferences — factor these into your notes and measurement recommendations:\n${prefLines.join('\n')}`
    : '';

  const prompt = `You are a precise body measurement estimation system. The user is ${heightCm}cm tall.

Analyze this full-body photo and estimate the following measurements in centimeters.
Use the provided height (${heightCm}cm) as your reference scale to calculate all other measurements proportionally.${prefsContext}

Return ONLY a valid JSON object with this exact structure, no explanation:
{
  "chest": <number>,
  "waist": <number>,
  "hips": <number>,
  "shoulder": <number>,
  "inseam": <number>,
  "confidence": <"high"|"medium"|"low">,
  "notes": <string, max 120 chars, brief observation about fit given the user's preferences>
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
