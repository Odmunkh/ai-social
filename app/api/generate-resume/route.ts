import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: "formData is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing" },
        { status: 500 },
      );
    }

    const prompt = `
You are an expert resume writer.

Convert the user's raw CV form data into a polished professional resume JSON.

Rules:
- Keep the response strictly valid JSON only.
- Do not include markdown.
- Do not include explanation text.
- Preserve facts. Do not invent companies, schools, dates, or skills.
- Improve grammar, clarity, and professionalism.
- Rewrite summary to sound concise and strong.
- Rewrite experience descriptions into achievement-oriented bullet text.
- If a field is missing, return an empty string.
- Keep the exact schema below.

Required JSON schema:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "experience": [
    {
      "company": "",
      "role": "",
      "start": "",
      "end": "",
      "description": ""
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "start": "",
      "end": ""
    }
  ],
  "skills": "",
  "languages": ""
}

User form data:
${JSON.stringify(formData, null, 2)}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "resume_output",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                fullName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" },
                summary: { type: "string" },
                experience: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      company: { type: "string" },
                      role: { type: "string" },
                      start: { type: "string" },
                      end: { type: "string" },
                      description: { type: "string" },
                    },
                    required: [
                      "company",
                      "role",
                      "start",
                      "end",
                      "description",
                    ],
                  },
                },
                education: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      school: { type: "string" },
                      degree: { type: "string" },
                      start: { type: "string" },
                      end: { type: "string" },
                    },
                    required: ["school", "degree", "start", "end"],
                  },
                },
                skills: { type: "string" },
                languages: { type: "string" },
              },
              required: [
                "fullName",
                "email",
                "phone",
                "location",
                "summary",
                "experience",
                "education",
                "skills",
                "languages",
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);

      return NextResponse.json(
        { error: "Failed to generate AI resume", details: errorText },
        { status: 500 },
      );
    }

    const data = await response.json();

    const content =
      data?.output?.[0]?.content?.find(
        (item: any) => item.type === "output_text",
      )?.text || data?.output_text;

    if (!content) {
      console.error("Unexpected OpenAI response:", data);
      return NextResponse.json(
        { error: "No AI content returned" },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({ success: true, resume: parsed });
  } catch (error) {
    console.error("Generate resume route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
