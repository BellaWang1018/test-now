"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  subject: string;
  content: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
  recipient: {
    id: number;
    name: string;
    role: string;
  };
  created_at: string;
  read: boolean;
}

export default function MessageInbox() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchMessages = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_URL}/api/messages`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const { data } = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [mounted]);

  const filteredMessages = messages.filter(message => 
    filter === 'all' || (filter === 'unread' && !message.read)
  );

  const markAsRead = async (messageId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/messages/${messageId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      setMessages(messages.map(message =>
        message.id === messageId ? { ...message, read: true } : message
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError('Failed to mark message as read');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <Link
            href="/messages/compose"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Compose Message
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread Messages
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <Link
                  key={message.id}
                  href={`/messages/${message.id}`}
                  onClick={() => !message.read && markAsRead(message.id)}
                  className={`block hover:bg-gray-50 ${
                    !message.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${
                            !message.read ? 'text-indigo-600' : 'text-gray-900'
                          }`}>
                            {message.subject}
                          </p>
                          {!message.read && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              New
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <p>
                            From: {message.sender.name} ({message.sender.role})
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 