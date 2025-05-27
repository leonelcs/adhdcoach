"use client";
import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ClientTaskList from '@/components/ClientTaskList';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/todoist/all');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <ClientTaskList tasks={tasks} loading={loading} />
        </div>
      </main>
    </div>
  );
}
