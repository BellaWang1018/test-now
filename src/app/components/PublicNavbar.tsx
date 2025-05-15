"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'student' | 'company';
  name?: string;
}

export default function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    }
  }, [mounted, pathname]);

  const handleLogout = () => {
    if (!mounted) return;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={isAuthenticated ? (user?.role === 'student' ? "/student/dashboard" : "/company/dashboard") : "/"}
              className="flex items-center"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                First Interns
              </span>
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Public navigation
              <>
                <Link
                  href="/internships"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Find Internships
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm"
                >
                  Login
                </Link>
              </>
            ) : user?.role === 'student' ? (
              // Student navigation
              <>
                <Link
                  href="/student/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/student/dashboard/jobs"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Find Internships
                </Link>
                <Link
                  href="/student/dashboard/internships"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  My Internships
                </Link>
                <Link
                  href="/student/dashboard/inbox"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Inbox
                </Link>
                <Link
                  href="/student/dashboard/settings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              // Company navigation
              <>
                <Link
                  href="/company/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/company/internships/new"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Create Internships
                </Link>
                <Link
                  href="/company/internships"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  My Postings
                </Link>
                <Link
                  href="/company/applications"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Applicants
                </Link>
                <Link
                  href="/messages"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Inbox
                </Link>
                <Link
                  href="/company/settings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 