import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase config missing" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    const { phone, email } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Phone эсвэл email хэрэгтэй" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`phone.eq.${phone || ""},email.eq.${email || ""}`)
      .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Profile унших үед алдаа гарлаа" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      plan: data.plan,
      credits: data.credits,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}
