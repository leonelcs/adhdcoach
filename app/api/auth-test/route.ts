import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "Auth test endpoint works" });
}