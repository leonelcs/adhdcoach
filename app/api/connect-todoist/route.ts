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
    // Assuming session.user.id exists and is the correct userId
    if (!session.user.id) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
    }
    await storeUserTodoistToken(session.user.id, token);

    // Client-side code to connect to Todoist
    await fetch('/api/connect-todoist', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // This sends the session cookie
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting Todoist:", error);
    return NextResponse.json(
      { error: "Failed to connect Todoist account" },
      { status: 500 }
    );
  }
}

