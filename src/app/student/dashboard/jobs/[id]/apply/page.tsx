'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  university: string;
  major: string;
  graduation_year: number;
  resume_path: string;
}

export default function ApplyJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_path: '',
    portfolio_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch job details
        const jobResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/internships/${resolvedParams.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!jobResponse.ok) {
          throw new Error('Failed to fetch job details');
        }

        const jobData = await jobResponse.json();
        const jobDetails = jobData.data || jobData;
        setJob(jobDetails);

        // Fetch student profile
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch student profile');
        }

        const profileData = await profileResponse.json();
        if (!profileData.profile) {
          throw new Error('Student profile not found. Please complete your profile first.');
        }
        setStudentProfile(profileData.profile);
        setFormData(prev => ({
          ...prev,
          resume_path: profileData.profile.resume_path || ''
        }));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/internships/${resolvedParams.id}/apply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            student_profiles_id: studentProfile.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      router.push('/student/dashboard/internships');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !job || !studentProfile) {
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
            Back to Job Details
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
            <p className="mt-1 text-lg text-gray-600">{job.company.name}</p>
          </div>

          <div className="px-6 py-5">
            {/* Student Profile Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{studentProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{studentProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">University</p>
                  <p className="text-gray-900">{studentProfile.university}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Major</p>
                  <p className="text-gray-900">{studentProfile.major}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Graduation Year</p>
                  <p className="text-gray-900">{studentProfile.graduation_year}</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  id="cover_letter"
                  name="cover_letter"
                  rows={6}
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Write your cover letter here..."
                  required
                />
              </div>

              <div>
                <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  id="portfolio_url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 