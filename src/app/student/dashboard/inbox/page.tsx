"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces
interface User {
  id: string;
  email: string;
  role: 'student' | 'company';
  name?: string;
}

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  user_id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

interface ConversationResponse {
  id: number;
  user_id: string;
  name: string;
  avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

export default function StudentInbox() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = useCallback(async (token: string, conversationId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/messages/${conversationId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const messagesData = data.data || data;

      setMessages(prev => ({
        ...prev,
        [conversationId]: messagesData
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const fetchConversations = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/messages`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      const conversationsData = Array.isArray(data) ? data : (data.data || []) as ConversationResponse[];

      // Remove any duplicate conversations based on id and user_id
      const uniqueConversations = conversationsData.reduce((acc: ConversationResponse[], current) => {
        const isDuplicate = acc.find(item => 
          item.id === current.id && item.user_id === current.user_id
        );
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Format conversations
      const formattedConversations = uniqueConversations.map(conv => ({
        id: conv.id,
        user_id: conv.user_id,
        name: conv.name,
        avatar: conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}`,
        lastMessage: conv.last_message,
        timestamp: new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: conv.unread_count,
        isOnline: conv.is_online
      }));

      setConversations(formattedConversations);
      
      // Set first conversation as active if available
      if (formattedConversations.length > 0) {
        const firstConversation = formattedConversations[0];
        setActiveConversation(firstConversation.id);
        await fetchMessages(token, firstConversation.id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  useEffect(() => {
    if (!mounted) return;

    const checkAuthAndFetchData = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        if (!authToken || !userData) {
          router.push('/auth/login');
          return;
        }
        
        const parsedUserData = JSON.parse(userData) as User;
        
        // Check if the user is a student
        if (parsedUserData.role !== 'student') {
          router.push('/company/dashboard');
          return;
        }
        
        setUser(parsedUserData);
        await fetchConversations(authToken);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndFetchData();
  }, [mounted, router, fetchConversations]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || activeConversation === null) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/messages`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: activeConversation,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh messages
      if (activeConversation !== null) {
        await fetchMessages(token, activeConversation);
      }

      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, activeConversation, fetchMessages]);

  const getConversationMessages = useCallback((conversationId: number) => {
    return messages[conversationId] || [];
  }, [messages]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo => {
    const query = searchQuery.toLowerCase();
    const name = convo.name.toLowerCase();
    const message = convo.lastMessage.toLowerCase();
    return name.includes(query) || message.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="divide-y">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation, index) => (
                <div
                  key={`conversation-${conversation.id}-${conversation.user_id}-${index}`}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    activeConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setActiveConversation(conversation.id);
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      fetchMessages(token, conversation.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{conversation.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                      {conversation.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="md:col-span-2">
          {activeConversation ? (
            <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
              {/* Messages Header */}
              <div className="p-4 border-b">
                <div className="flex items-center">
                  {conversations.find(c => c.id === activeConversation) && (
                    <>
                      <img
                        src={conversations.find(c => c.id === activeConversation)?.avatar}
                        alt={conversations.find(c => c.id === activeConversation)?.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium">
                          {conversations.find(c => c.id === activeConversation)?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {conversations.find(c => c.id === activeConversation)?.isOnline
                            ? 'Online'
                            : 'Offline'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getConversationMessages(activeConversation).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 