"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Application {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    university: string;
    major: string;
    graduation_year: number;
    skills: string[];
    bio: string | null;
    resume_path: string | null;
    user?: {
      id: number;
    };
  };
  internship: {
    id: number;
    title: string;
  };
  application: {
    cover_letter: string;
    resume_path: string | null;
    portfolio_url: string | null;
  };
  student_status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  company_status: 'pending' | 'send interview invitation' | 'interviewing' | 'reviewing' | 'accepted' | 'rejected';
  created_at: string;
}

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await axios.get(`${API_URL}/api/company/applications/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.data || !response.data.data) {
          throw new Error('Invalid response format');
        }

        setApplication(response.data.data);
      } catch (error: unknown) {
        console.error('Error fetching application details:', error);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError(error instanceof Error ? error.message : 'Failed to fetch application details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [resolvedParams.id, router]);

  const handleStatusUpdate = async (newStatus: Application['company_status']) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to update application status');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await axios.put(
        `${API_URL}/api/company/applications/${resolvedParams.id}/status`,
        { company_status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = response.data;
      setApplication(data);

      // If status is "send interview invitation", create a message for the student
      if (newStatus === 'send interview invitation' && data.student?.user?.id) {
        try {
          await axios.post(
            `${API_URL}/api/company/messages`,
            {
              receiver_id: data.student.user.id,
              receiver_role: 'student',
              content: `You have received an interview invitation for the ${data.internship.title} position. Please check your application status and respond accordingly.`
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (error: unknown) {
          console.error('Failed to send notification message:', error);
          // Don't throw error here as the status update was successful
        }
      }
    } catch (error: unknown) {
      console.error('Error updating status:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to update status');
      }
    }
  };

  const getStatusColor = (status: Application['company_status']) => {
    const currentStatus = status || 'pending';
    switch (currentStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'send interview invitation':
        return 'bg-blue-100 text-blue-800';
      case 'interviewing':
        return 'bg-purple-100 text-purple-800';
      case 'reviewing':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || 'Application not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Candidates
          </button>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.company_status)}`}>
              {application.company_status.replace(/_/g, ' ').toUpperCase()}
            </span>
            <select
              value={application.company_status}
              onChange={(e) => handleStatusUpdate(e.target.value as Application['company_status'])}
              className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="send interview invitation">Send Interview Invitation</option>
              <option value="interviewing">Interviewing</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Application Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Student information and application materials</p>
          </div>

          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Student Information</h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {application?.student && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.student.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.student.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">University</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.student.university}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Major</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.student.major}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Graduation Year</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.student.graduation_year}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {application?.student?.bio && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Bio</h4>
                <p className="text-sm text-gray-600">{application.student.bio}</p>
              </div>
            )}

            {application?.student?.skills && application.student.skills.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {application.student.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {application?.application?.cover_letter && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{application.application.cover_letter}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              {application?.student?.resume_path && (
                <a
                  href={application.student.resume_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Resume
                </a>
              )}
              {application?.application?.portfolio_url && (
                <a
                  href={application.application.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 