import { Chat } from '@/components/Chat';
import { PersonalityEditor } from '@/components/PersonalityEditor';

export default function Home() {
  // Using the same hardcoded user ID as in Chat component
  const userId = 'test-user-123';

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">AI Chat Assistant</h1>
        
        <div className="grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="order-2 md:order-1">
            <PersonalityEditor userId={userId} />
          </div>
          <div className="order-1 md:order-2">
            <Chat userId={userId} />
          </div>
        </div>
      </div>
    </main>
  );
}
