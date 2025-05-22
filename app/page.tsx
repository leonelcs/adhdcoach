import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import Navbar from '@/components/Navbar';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <TaskList />
        </div>
      </main>
    </div>
  );
}
