import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, resumeId, paymentReference } = body;

    const data = await resend.emails.send({
      from: "CV Builder <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: "New payment confirmation request",
      html: `
        <h2>New payment confirmation request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Resume ID:</strong> ${resumeId}</p>
        <p><strong>Payment Reference:</strong> ${paymentReference || "-"}</p>
        <p><strong>Bank:</strong> Golomt Bank</p>
        <p><strong>Account Name:</strong> Odmunkh</p>
        <p><strong>Account Number:</strong> 1105408296</p>
        <p><strong>Amount:</strong> 4900₮</p>
        <p>Payment needs to be reviewed.</p>
      `,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Notify error:", error);
    return new Response("Failed to send email", { status: 500 });
  }
}
