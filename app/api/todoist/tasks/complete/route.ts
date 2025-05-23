import { NextResponse } from "next/server";
import { completeTask } from "@/lib/todoist";

export async function POST(request: Request) {
  console.log("🔔 POST /api/todoist/tasks/complete");
  const { taskId } = await request.json();
  console.log("🔔 parsed taskId =", taskId);
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }
  await completeTask(taskId); // your server fn
  return NextResponse.json({ success: true });
}