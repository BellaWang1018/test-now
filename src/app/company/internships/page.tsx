"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Internship {
  id: string;
  title: string;
  company_name: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary_range: string;
  description: string;
  requirements: string[];
  application_deadline: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  application_count: number;
}

export default function CompanyInternships() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchInternships = async () => {
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

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_URL}/api/company/internships`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch internships');
        }

        const { data } = await response.json();
        setInternships(data);
      } catch (error) {
        console.error('Error fetching internships:', error);
        setError('Failed to load internships');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [router, mounted]);

  const handleStatusChange = async (internshipId: string, newStatus: 'active' | 'closed') => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/internships/${internshipId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update internship status');
      }

      setInternships(prev =>
        prev.map(internship =>
          internship.id === internshipId
            ? { ...internship, status: newStatus }
            : internship
        )
      );
    } catch (error) {
      console.error('Error updating internship status:', error);
      setError('Failed to update internship status');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Internships</h1>
        <Link
          href="/company/internships/new"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post New Internship
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {internships.map((internship) => (
                <tr key={internship.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{internship.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{internship.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{internship.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{internship.application_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(internship.application_deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        internship.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {internship.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        href={`/company/internships/${internship.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/company/internships/${internship.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            internship.id,
                            internship.status === 'active' ? 'closed' : 'active'
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {internship.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {internships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No internships posted yet.</p>
            <Link
              href="/company/internships/new"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-900"
            >
              Post your first internship
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 