import { getButtons } from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(getButtons());
}
