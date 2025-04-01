import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">AI Chat Assistant</h1>
        <Chat />
      </div>
    </main>
  );
}
