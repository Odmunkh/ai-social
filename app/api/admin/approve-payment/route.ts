import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const planCredits: Record<string, number> = {
  Starter: 30,
  Pro: 150,
  Business: 400,
};

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase server config missing" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId missing" }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payment_requests")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 },
      );
    }

    const creditsToAdd = planCredits[payment.plan] || 30;
    const userKey = payment.email || payment.phone;

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`email.eq.${payment.email || ""},phone.eq.${payment.phone}`)
      .maybeSingle();

    if (existingProfile) {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: payment.plan,
          credits: (existingProfile.credits || 0) + creditsToAdd,
        })
        .eq("id", existingProfile.id);
    } else {
      await supabaseAdmin.from("profiles").insert({
        email: payment.email || null,
        phone: payment.phone,
        plan: payment.plan,
        credits: creditsToAdd,
      });
    }

    await supabaseAdmin
      .from("payment_requests")
      .update({ status: "approved" })
      .eq("id", paymentId);

    return NextResponse.json({
      ok: true,
      creditsAdded: creditsToAdd,
      userKey,
    });
  } catch (error) {
    console.error("Approve payment error:", error);

    return NextResponse.json(
      { error: "Approve payment failed" },
      { status: 500 },
    );
  }
}
