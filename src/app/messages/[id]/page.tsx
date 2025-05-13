"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MessageDetail({ params }: PageProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchMessage = async () => {
      try {
        const resolvedParams = await params;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_URL}/api/messages/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch message');
        }

        const { data } = await response.json();
        setMessage(data);

        // Mark message as read if it's not already
        if (!data.read) {
          await fetch(`${API_URL}/api/messages/${resolvedParams.id}/read`, {
            method: 'PATCH',
          });
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        setError('Failed to load message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [mounted, params]);

  const handleDelete = async () => {
    if (!message) return;

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/messages/${message.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      router.push('/messages');
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">
          {error || 'Message not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Message</h1>
          <div className="flex space-x-4">
            <Link
              href={`/messages/compose?reply_to=${message.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Reply
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{message.subject}</h2>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <p>
                From: {message.sender.name} ({message.sender.role})
              </p>
              <span className="mx-2">•</span>
              <p>
                To: {message.recipient.name} ({message.recipient.role})
              </p>
              <span className="mx-2">•</span>
              <p>
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="prose max-w-none">
              {message.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/messages"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Messages
          </Link>
        </div>
      </div>
    </div>
  );
} 