// app/api/url/increment/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    const { id, currentCount } = await request.json();
    const { data, error } = await supabase
        .from("urls")
        .update({ click_count: currentCount + 1 })
        .eq("id", id);
    if (error) {
        return NextResponse.json({ message: "Error updating counter", error: error.message }, { status: 500 });
    }
    console.log('aumentando el contador', currentCount + 1)
    return NextResponse.json({ message: "Counter updated", data });
}
