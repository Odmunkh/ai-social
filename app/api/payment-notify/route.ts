import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response("Server email configuration missing", {
        status: 500,
      });
    }

    if (!adminEmail) {
      console.error("Missing ADMIN_EMAIL");
      return new Response("Admin email configuration missing", { status: 500 });
    }

    const resend = new Resend(apiKey);

    const body = await req.json();
    const { fullName, email, resumeId, paymentReference } = body;

    const data = await resend.emails.send({
      from: "CV Builder <onboarding@resend.dev>",
      to: adminEmail,
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
