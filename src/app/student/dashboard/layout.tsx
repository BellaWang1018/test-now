"use client"

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentUser } from '../../types/student';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!mounted) return;
    
    try {
      // Check authentication
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        
        // Check if the user is a student
        if (parsedUserData.role !== 'student') {
          router.push('/company/dashboard');
          return;
        }
        
        setUser(parsedUserData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setLoading(false);
    }
  }, [router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {children}
      </main>
    </div>
  );
} 