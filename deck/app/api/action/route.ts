import { type NextRequest, NextResponse } from "next/server";
import { performAction } from "@/lib/actions";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    await performAction(body.actionId);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
