'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Job {
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

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/internships/${resolvedParams.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        const jobData = data.data || data;
        setJob({
          id: jobData.id,
          title: jobData.title,
          company: {
            id: jobData.company.id,
            name: jobData.company.name || jobData.company.company_name,
          },
          location: jobData.location,
          type: jobData.type,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          description: jobData.description,
          created_at: jobData.created_at,
          application_deadline: jobData.application_deadline,
          status: jobData.status,
          accepts_opt: jobData.accepts_opt,
          accepts_cpt: jobData.accepts_cpt,
          offers_certificate: jobData.offers_certificate,
          hard_requirements: jobData.hard_requirements,
          application_count: jobData.application_count,
          is_active: jobData.is_active,
          application_status: jobData.application_status
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error || 'Job not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-1 text-lg text-gray-600">{job.company.name}</p>
              </div>
              <Link
                href={`/student/dashboard/jobs/${job.id}/apply`}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  job.status === 'open' && !job.application_status
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150`}
              >
                {job.application_status ? 'View Application' : 'Apply Now'}
              </Link>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-sm text-gray-900">{job.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Salary Range</h3>
                <p className="mt-1 text-sm text-gray-900">
                  ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Application Deadline</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(job.application_deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{job.status}</p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <svg className={`h-5 w-5 ${job.accepts_opt ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={job.accepts_opt ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  <span className="text-sm text-gray-600">Accepts OPT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className={`h-5 w-5 ${job.accepts_cpt ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={job.accepts_cpt ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  <span className="text-sm text-gray-600">Accepts CPT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className={`h-5 w-5 ${job.offers_certificate ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={job.offers_certificate ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  <span className="text-sm text-gray-600">Offers Certificate</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Hard Requirements */}
            {job.hard_requirements && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hard Requirements</h3>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {job.hard_requirements.split('\n').map((requirement, index) => (
                    <p key={index} className="mb-2">{requirement}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 