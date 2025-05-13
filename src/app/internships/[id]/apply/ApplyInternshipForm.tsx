"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Internship {
  id: number;
  title: string;
  company: {
    name: string;
    id: number;
  };
}

interface StudentProfile {
  name: string;
  email: string;
  university: string;
  major: string;
  graduation_year: number;
  gpa: number;
  visa_status: string;
  opt_status?: string;
  cpt_status?: string;
  resume_url?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface ApplicationForm {
  cover_letter: string;
  resume_url: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  additional_notes?: string;
}

interface ApplyInternshipFormProps {
  internshipId: string;
}

export default function ApplyInternshipForm({ internshipId }: ApplyInternshipFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<ApplicationForm>({
    cover_letter: '',
    resume_url: '',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    additional_notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        
        // Fetch internship details
        const internshipResponse = await fetch(`${API_URL}/api/internships/${internshipId}`);
        if (!internshipResponse.ok) {
          throw new Error('Failed to fetch internship details');
        }
        const { data: internshipData } = await internshipResponse.json();
        setInternship(internshipData);

        // Fetch student profile
        const profileResponse = await fetch(`${API_URL}/api/student/profile`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch student profile');
        }
        const { data: profileData } = await profileResponse.json();
        setProfile(profileData);

        // Pre-fill form with profile data
        setFormData(prev => ({
          ...prev,
          resume_url: profileData.resume_url || '',
          portfolio_url: profileData.portfolio_url || '',
          github_url: profileData.github_url || '',
          linkedin_url: profileData.linkedin_url || ''
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted, internshipId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/internships/${internshipId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      router.push(`/internships/${internshipId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error || !internship || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">
          {error || 'Required data not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/internships/${internshipId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Internship Details
        </Link>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Apply for {internship.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {internship.company.name}
            </p>

            {/* Student Profile Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">University</p>
                  <p className="text-gray-900">{profile.university}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Major</p>
                  <p className="text-gray-900">{profile.major}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Graduation Year</p>
                  <p className="text-gray-900">{profile.graduation_year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">GPA</p>
                  <p className="text-gray-900">{profile.gpa}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Visa Status</p>
                  <p className="text-gray-900">{profile.visa_status}</p>
                </div>
                {profile.opt_status && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">OPT Status</p>
                    <p className="text-gray-900">{profile.opt_status}</p>
                  </div>
                )}
                {profile.cpt_status && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPT Status</p>
                    <p className="text-gray-900">{profile.cpt_status}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cover_letter"
                  name="cover_letter"
                  rows={6}
                  required
                  value={formData.cover_letter}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Explain why you're a good fit for this position..."
                />
              </div>

              <div>
                <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700">
                  Resume URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="resume_url"
                  name="resume_url"
                  required
                  value={formData.resume_url}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio_url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="github_url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  id="additional_notes"
                  name="additional_notes"
                  rows={3}
                  value={formData.additional_notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link
                  href={`/internships/${internshipId}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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