"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  description: string;
  location: string;
  salary_min: number | '';
  salary_max: number | '';
  accepts_opt: boolean;
  accepts_cpt: boolean;
  offers_certificate: boolean;
  hard_requirements: string;
  application_deadline: string;
  status: string;
  is_active: boolean;
}

interface EditInternshipFormProps {
  internshipId: string;
}

export default function EditInternshipForm({ internshipId }: EditInternshipFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    salary_min: '',
    salary_max: '',
    accepts_opt: false,
    accepts_cpt: false,
    offers_certificate: false,
    hard_requirements: '',
    application_deadline: '',
    status: 'open',
    is_active: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchInternship = async () => {
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
        const response = await fetch(`${API_URL}/api/company/internships/${internshipId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch internship data');
        }

        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          salary_min: data.salary_min || '',
          salary_max: data.salary_max || '',
          accepts_opt: data.accepts_opt || false,
          accepts_cpt: data.accepts_cpt || false,
          offers_certificate: data.offers_certificate || false,
          hard_requirements: data.hard_requirements || '',
          application_deadline: data.application_deadline ? new Date(data.application_deadline).toISOString().split('T')[0] : '',
          status: data.status || 'open',
          is_active: data.is_active ?? true
        });
      } catch (error) {
        console.error('Error fetching internship:', error);
        setError('Failed to load internship data');
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [router, mounted, internshipId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/internships/${internshipId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update internship');
      }

      router.push('/company/internships');
    } catch (error) {
      console.error('Error updating internship:', error);
      setError('Failed to update internship. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const API_URL = 'http://localhost:8001';
      const deleteUrl = `${API_URL}/api/company/internships/${internshipId}`;
      console.log('Deleting internship:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Delete error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: deleteUrl
        });
        throw new Error(errorData?.message || 'Failed to delete internship');
      }

      router.push('/company/internships');
    } catch (error) {
      console.error('Error deleting internship:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete internship. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Internships
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Edit Internship</h1>
          </div>

          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Internship Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe the internship responsibilities, projects, and what interns will learn"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700">
                    Minimum Salary
                  </label>
                  <input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. 20000"
                  />
                </div>

                <div>
                  <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700">
                    Maximum Salary
                  </label>
                  <input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. 30000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700">
                  Application Deadline *
                </label>
                <input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="hard_requirements" className="block text-sm font-medium text-gray-700">
                  Hard Requirements
                </label>
                <textarea
                  id="hard_requirements"
                  name="hard_requirements"
                  value={formData.hard_requirements}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="List specific skills, coursework, or qualifications required"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Internship Qualifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="accepts_opt"
                      name="accepts_opt"
                      type="checkbox"
                      checked={formData.accepts_opt}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="accepts_opt" className="ml-2 block text-sm text-gray-700">
                      Accepts OPT (Optional Practical Training)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="accepts_cpt"
                      name="accepts_cpt"
                      type="checkbox"
                      checked={formData.accepts_cpt}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="accepts_cpt" className="ml-2 block text-sm text-gray-700">
                      Accepts CPT (Curricular Practical Training)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="offers_certificate"
                      name="offers_certificate"
                      type="checkbox"
                      checked={formData.offers_certificate}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="offers_certificate" className="ml-2 block text-sm text-gray-700">
                      Offers Certificate
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Internship
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Internship</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this internship? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  deleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 