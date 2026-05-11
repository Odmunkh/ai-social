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

    const {
      businessType,
      product,
      goal,
      tone,
      platform,
      headline,
      offer,
      cta,
    } = body;

    if (!businessType || !product || !goal) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const prompt = `
Create a premium finished social media advertisement poster with integrated readable typography.

Business type: ${businessType}
Product/service: ${product}
Campaign goal: ${goal}
Brand tone: ${tone}
Platform: ${platform}

Poster text to include:
Headline: ${headline || product}
Offer: ${offer || ""}
CTA: ${cta || "Order now"}

Design style:
- Premium modern Facebook/Instagram ad poster
- Dark luxury background with pink / purple neon accents
- Professional graphic design layout
- Strong product hero composition
- Beautiful spacing and hierarchy
- Glossy commercial lighting
- Clean premium typography
- Large readable headline
- Offer badge if offer exists
- CTA button-style element
- Looks like a finished ad creative made by a senior designer
- No tiny unreadable text
- No random extra words
- No duplicated text
- No watermark
- High-end social media campaign design

Layout:
- Portrait poster
- Keep all text inside safe margins
- Product/service should be visually attractive
- Balanced composition
- Dark planet / neon pink aesthetic
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
