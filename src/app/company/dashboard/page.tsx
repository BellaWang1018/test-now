"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompanyUser {
  id: string;
  email: string;
  company_name: string;
  role: 'company';
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  internship: {
    id: string;
    title: string;
  };
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  created_at: string;
}

interface DashboardStats {
  total_internships: number;
  active_internships: number;
  total_applications: number;
  new_applications: number;
}

interface RecentApplication {
  id: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  internship: {
    id: string;
    title: string;
  };
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  applied_at: string;
}

interface InternshipData {
  id: string;
  is_active?: boolean;
  status?: 'open' | 'closed' | 'filled';
  application_count?: number;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_internships: 0,
    active_internships: 0,
    total_applications: 0,
    new_applications: 0
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchDashboardData = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        if (!authToken || !userData) {
          router.push('/auth/login');
          return;
        }

        const parsedUserData = JSON.parse(userData);
        
        if (parsedUserData.role !== 'company') {
          router.push('/student/dashboard');
          return;
        }

        setUser(parsedUserData);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        
        // Fetch company internships
        const statsResponse = await fetch(`${API_URL}/api/company/internships`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch company internships');
        }

        const internshipsData = await statsResponse.json();
        console.log('Internships Data:', internshipsData);

        // Handle both array and object with data property formats
        const internships = Array.isArray(internshipsData) ? internshipsData : (internshipsData.data || []);

        // Fetch applications count
        const applicationsResponse = await fetch(`${API_URL}/api/company/applications`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!applicationsResponse.ok) {
          throw new Error('Failed to fetch applications');
        }

        const applicationsData = await applicationsResponse.json();
        const applications: Application[] = applicationsData.data || [];

        setStats({
          total_internships: internships.length,
          active_internships: internships.filter((i: InternshipData) => i.is_active || i.status === 'open').length,
          total_applications: applications.length,
          new_applications: applications.filter((app: Application) => {
            const createdAt = new Date(app.created_at);
            const now = new Date();
            const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            return diffInHours <= 24;
          }).length
        });

        // Transform applications to match RecentApplication interface
        const recentApps: RecentApplication[] = applications.slice(0, 5).map(app => ({
          id: app.id,
          student: app.student,
          internship: app.internship,
          status: app.status,
          applied_at: app.created_at
        }));

        setRecentApplications(recentApps);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, mounted]);

  const getStatusColor = (status: RecentApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.company_name}
            </p>
          </div>
          <Link
            href="/company/internships/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Post New Internship
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Internships</h3>
            <p className="text-2xl font-bold">{stats.total_internships}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Internships</h3>
            <p className="text-2xl font-bold">{stats.active_internships}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
            <p className="text-2xl font-bold">{stats.total_applications}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">New Applications</h3>
            <p className="text-2xl font-bold">{stats.new_applications}</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
              <Link
                href="/company/applications"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.student.first_name} {application.student.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {application.internship.title}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {application.student.email}
                        </div>
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Applied on {formatDate(application.applied_at)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {(application.status || 'pending').charAt(0).toUpperCase() + (application.status || 'pending').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by posting an internship.</p>
                <div className="mt-6">
                  <Link
                    href="/company/internships/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Post Internship
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 