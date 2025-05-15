"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Internship {
  id: number;
  title: string;
  company: {
    name: string;
    id: number;
  };
  location: string;
  type: string;
  salary_min: number;
  salary_max: number;
  description: string;
  created_at: string;
  application_deadline: string;
  status: 'open' | 'closed' | 'filled';
  accepts_opt: boolean;
  accepts_cpt: boolean;
  offers_certificate: boolean;
  hard_requirements: string;
  application_count: number;
  is_active: boolean;
  application_status?: 'applied' | 'interviewing' | 'offered' | 'rejected';
}

interface InternshipDetailsProps {
  internshipId: string;
}

export default function InternshipDetails({ internshipId }: InternshipDetailsProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchInternship = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        console.log('Fetching internship:', `${API_URL}/api/internships/${internshipId}`);
        
        const response = await fetch(`${API_URL}/api/internships/${internshipId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch internship details: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        console.log('API Response:', responseData);
        
        // Handle both response formats: { data: {...} } and direct internship object
        const internshipData = responseData.data || responseData;
        
        if (!internshipData || typeof internshipData !== 'object') {
          throw new Error('Invalid API response format: expected internship object');
        }

        setInternship(internshipData);
      } catch (error) {
        console.error('Error fetching internship:', error);
        setError(error instanceof Error ? error.message : 'Failed to load internship details');
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [mounted, internshipId]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-4">
            {error || 'Internship not found'}
          </div>
          <Link
            href="/internships"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Internships List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/internships"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Internships
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {internship.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {internship.company.name}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                internship.status === 'open' ? 'bg-green-100 text-green-800' :
                internship.status === 'closed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(internship.status || 'pending').charAt(0).toUpperCase() + (internship.status || 'pending').slice(1)}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {internship.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${internship.salary_min?.toLocaleString()} - ${internship.salary_max?.toLocaleString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Apply by {new Date(internship.application_deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {internship.accepts_opt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      OPT
                    </span>
                  )}
                  {internship.accepts_cpt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      CPT
                    </span>
                  )}
                  {internship.offers_certificate && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Certificate
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Posted on {new Date(internship.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  {internship.application_count} applications received
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-600">
                {internship.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose max-w-none text-gray-600">
                {internship.hard_requirements}
              </div>
            </div>

            {/* Application Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {internship.application_status ? (
                    <span className="text-indigo-600">
                      You have already applied for this position
                    </span>
                  ) : (
                    <span>
                      {internship.application_count} other applicants
                    </span>
                  )}
                </div>
                <Link
                  href={`/internships/${internship.id}/apply`}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    internship.status === 'open' && !internship.application_status
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {internship.application_status ? 'View Application' : 'Apply Now'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 