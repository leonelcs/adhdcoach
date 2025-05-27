"use client";
import { useState } from 'react';

interface Message {
  role: string;
  content: string;
}

export default function GeminiAgent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are an AI assistant for ADHD coaching. Help the user manage tasks, focus, and build better habits.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Add the new user message to the conversation
      const updatedMessages = [...messages, userMessage];
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }
      
      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.slice(1).map((message, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || input.trim() === ''}
          className="bg-blue-600 text-white px-4 py-2 rounded-full disabled:bg-blue-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}
