"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function CompanyProfile() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    size: '',
    founded_year: '',
    logo_url: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchProfile = async () => {
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

        setFormData({
          company_name: parsedUserData.company_name || '',
          email: parsedUserData.email || '',
          description: parsedUserData.description || '',
          website: parsedUserData.website || '',
          location: parsedUserData.location || '',
          industry: parsedUserData.industry || '',
          size: parsedUserData.size || '',
          founded_year: parsedUserData.founded_year?.toString() || '',
          logo_url: parsedUserData.logo_url || ''
        });

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_URL}/api/company/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const { data } = await response.json();
        setFormData(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const { data } = await response.json();
      setFormData(prev => ({ ...prev, ...data }));
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="founded_year"
                  name="founded_year"
                  value={formData.founded_year}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 