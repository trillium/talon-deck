import { NextResponse } from "next/server";
import { getButtons } from "@/lib/config";

export async function GET() {
  return NextResponse.json(getButtons());
}
