import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { storeUserTodoistToken } from "@/lib/todoist";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get token from request
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Store the token
    if (!session.user.id) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
    }
    await storeUserTodoistToken(session.user.id, token);

    // ✅ No need to call fetch here!

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting Todoist:", error);
    return NextResponse.json(
      { error: "Failed to connect Todoist account" },
      { status: 500 }
    );
  }
}

