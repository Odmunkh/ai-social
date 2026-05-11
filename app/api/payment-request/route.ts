import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase server config missing" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    const { name, phone, email, plan, amount, transactionNote } = body;

    if (!name || !phone || !plan || !amount || !transactionNote) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.from("payment_requests").insert({
      name,
      phone,
      email,
      plan,
      amount,
      transaction_note: transactionNote,
      status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (resendKey && adminEmail) {
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "AI Content Studio <onboarding@resend.dev>",
        to: adminEmail,
        subject: "Шинэ төлбөрийн хүсэлт ирлээ",
        html: `
          <h2>Шинэ төлбөрийн хүсэлт</h2>
          <p><b>Нэр:</b> ${name}</p>
          <p><b>Утас:</b> ${phone}</p>
          <p><b>Email:</b> ${email || "-"}</p>
          <p><b>Багц:</b> ${plan}</p>
          <p><b>Дүн:</b> ${Number(amount).toLocaleString()}₮</p>
          <p><b>Гүйлгээний утга:</b> ${transactionNote}</p>
          <p>
            <a href="http://localhost:3000/admin/payments">
              Admin дээр шалгах
            </a>
          </p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Payment request error:", error);

    return NextResponse.json(
      { error: "Payment request failed" },
      { status: 500 },
    );
  }
}
