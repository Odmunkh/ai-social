import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY missing" },
        { status: 500 },
      );
    }

    const body = await req.json();

    const { businessType, product, goal, tone, platform } = body;

    if (!businessType || !product || !goal) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const prompt = `
Create a premium social media advertising poster BACKGROUND ONLY.

Business type: ${businessType}
Product/service: ${product}
Campaign goal: ${goal}
Brand tone: ${tone}
Platform: ${platform}

IMPORTANT:
- Do NOT include any text
- Do NOT include letters
- Do NOT include numbers
- Do NOT include prices
- Do NOT include currency symbols
- Do NOT include logo
- Leave clean empty space for text overlay

Design:
- Premium Facebook / Instagram ad visual
- Dark luxury background
- Neon pink and purple accents
- Professional product hero composition
- Glossy commercial lighting
- Clean safe margins
- High-end modern advertising style
- Looks like a senior designer made it
`;

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
    });

    return NextResponse.json({
      image: response.data?.[0]?.b64_json || null,
    });
  } catch (error) {
    console.error("Generate image error:", error);

    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 },
    );
  }
}
