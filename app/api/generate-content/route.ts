import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { businessType, product, goal, tone, platform } = body;

    if (!businessType || !product || !goal) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const prompt = `
Чи Монгол social media marketing copywriter.

Дараах мэдээлэл дээр үндэслээд ${platform || "Facebook"}-д тохирох пост бич.

Бизнесийн төрөл: ${businessType}
Бүтээгдэхүүн/үйлчилгээ: ${product}
Зорилго: ${goal}
Өнгө аяс: ${tone || "Найрсаг"}

Заавал багтаа:
1. Анхаарал татах hook
2. Гол caption
3. Call to action
4. 5-8 hashtag

Монгол хэлээр, natural, зар сурталчилгаа шиг хэт хиймэл биш бич.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const result = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate content error:", error);

    return NextResponse.json(
      { error: "AI content generation failed" },
      { status: 500 },
    );
  }
}
