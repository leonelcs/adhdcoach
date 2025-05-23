// app/tasks/page.tsx (server component)
import { Suspense } from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ClientTaskList from "@/components/ClientTaskList";

export default function TasksPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      <Suspense fallback={<div>Loading tasks...</div>}>
        <ClientTaskList />
      </Suspense>
    </div>
  );
}