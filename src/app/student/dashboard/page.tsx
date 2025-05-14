"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardStats, InternshipOpportunity } from '../../types/student';

export default function StudentDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    applied: 0,
    responses: 0,
    rejections: 0,
    interviews: 0
  });
  const [newOpportunities, setNewOpportunities] = useState<InternshipOpportunity[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if the user is logged in
    try {
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (!authToken || !userData) {
        router.push('/auth/login');
        return;
      }

      const parsedUserData = JSON.parse(userData);
      
      // Check if the user is a student
      if (parsedUserData.role !== 'student') {
        router.push('/company/dashboard');
        return;
      }
      
      fetchDashboardData(authToken);
    } catch (e) {
      console.error('Error loading user data', e);
      router.push('/auth/login');
    }
  }, [router, mounted]);

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      // Fetch application stats
      const statsResponse = await fetch(
        `${API_URL}/api/student/applications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch application stats');
      }

      const { stats } = await statsResponse.json();
      
      // Set stats from backend
      setStats({
        applied: stats.total,
        responses: stats.responses,
        rejections: stats.rejections,
        interviews: stats.interviews
      });

      // Fetch new opportunities
      const opportunitiesResponse = await fetch(
        `${API_URL}/api/student/internships`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!opportunitiesResponse.ok) {
        throw new Error('Failed to fetch opportunities');
      }

      const { data: opportunities } = await opportunitiesResponse.json();
      setNewOpportunities(opportunities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Applications</h3>
          <p className="text-2xl font-bold">{stats.applied}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Responses</h3>
          <p className="text-2xl font-bold">{stats.responses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Rejections</h3>
          <p className="text-2xl font-bold">{stats.rejections}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Interviews</h3>
          <p className="text-2xl font-bold">{stats.interviews}</p>
        </div>
      </div>

      {/* New Opportunities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">New Opportunities</h2>
          <Link 
            href="/student/dashboard/jobs" 
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            View all
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="space-y-4">
          {newOpportunities.length > 0 ? (
            newOpportunities.slice(0, 3).map((opportunity) => (
              <Link 
                key={opportunity.id} 
                href={`/student/dashboard/jobs/${opportunity.id}`}
                className="block border border-gray-100 rounded-lg p-4 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                      {opportunity.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-600 text-sm">{opportunity.company?.name}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-gray-500 text-sm">{opportunity.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        ${opportunity.salary_min?.toLocaleString()} - ${opportunity.salary_max?.toLocaleString()}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        Deadline: {new Date(opportunity.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        opportunity.status === 'open' ? 'bg-green-100 text-green-800' :
                        opportunity.status === 'closed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(opportunity.status || 'pending').charAt(0).toUpperCase() + (opportunity.status || 'pending').slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {opportunity.accepts_opt && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            OPT
                          </span>
                        )}
                        {opportunity.accepts_cpt && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            CPT
                          </span>
                        )}
                        {opportunity.offers_certificate && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Certificate
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by browsing available internships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 