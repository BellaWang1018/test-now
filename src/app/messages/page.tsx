"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  role: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  user_id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

interface ConversationResponse {
  id: number;
  user_id: number;
  name: string;
  avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

export default function MessageInbox() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({});

  const fetchConversations = useCallback(async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      const conversationsData: ConversationResponse[] = data.data || data;

      // Format conversations
      const formattedConversations = conversationsData.map((conv) => ({
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
        setActiveConversation(formattedConversations[0].id);
        fetchMessages(token, formattedConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (!authToken || !userData) {
        router.push('/auth/login');
        return;
      }
      
      const parsedUserData: User = JSON.parse(userData);
      setUser(parsedUserData);
      fetchConversations(authToken);
    } catch (e) {
      console.error('Error loading user data', e);
      router.push('/auth/login');
    }
  }, [router, mounted, fetchConversations]);

  const fetchMessages = async (token: string, conversationId: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/messages/${conversationId}`, {
        headers: {
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
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      if (activeConversation) {
        fetchMessages(token, activeConversation);
      }

      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getConversationMessages = (conversationId: number) => {
    return messages[conversationId] || [];
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo => 
    convo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted || loading) {
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
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium mb-2">No conversations found</p>
                <p className="text-sm">Start a new conversation or try a different search term</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
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
                      <div className="relative w-10 h-10 mr-3">
                        <Image
                          src={conversation.avatar}
                          alt={conversation.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{conversation.name}</h3>
                        <p className="text-sm text-gray-500">{conversation.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{conversation.timestamp}</span>
                      {conversation.unread > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {activeConversation ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">
                  {conversations.find(c => c.id === activeConversation)?.name}
                </h2>
              </div>
              
              <div className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
                {getConversationMessages(activeConversation).length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  getConversationMessages(activeConversation).slice().reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.sender_id === user?.id ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {message.content}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 