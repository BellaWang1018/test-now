"use client"

import React, { useEffect, useState } from 'react';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  max_file_size: number;
  allowed_file_types: string[];
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  default_user_role: string;
  max_internships_per_company: number;
  max_applications_per_student: number;
}

export default function SystemSettings() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await fetch(`${API_URL}/api/admin/settings`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const { data } = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSuccess('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      };
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  id="site_name"
                  name="site_name"
                  value={settings?.site_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  id="site_description"
                  name="site_description"
                  rows={3}
                  value={settings?.site_description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={settings?.contact_email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">File Upload Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="max_file_size" className="block text-sm font-medium text-gray-700">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  id="max_file_size"
                  name="max_file_size"
                  value={settings?.max_file_size}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="allowed_file_types" className="block text-sm font-medium text-gray-700">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  id="allowed_file_types"
                  name="allowed_file_types"
                  value={settings?.allowed_file_types.join(', ')}
                  onChange={(e) => {
                    const types = e.target.value.split(',').map(type => type.trim());
                    setSettings(prev => prev ? { ...prev, allowed_file_types: types } : null);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="pdf, doc, docx"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  name="maintenance_mode"
                  checked={settings?.maintenance_mode}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="registration_enabled"
                  name="registration_enabled"
                  checked={settings?.registration_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="registration_enabled" className="ml-2 block text-sm text-gray-900">
                  Enable Registration
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_verification_required"
                  name="email_verification_required"
                  checked={settings?.email_verification_required}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="email_verification_required" className="ml-2 block text-sm text-gray-900">
                  Require Email Verification
                </label>
              </div>
              <div>
                <label htmlFor="default_user_role" className="block text-sm font-medium text-gray-700">
                  Default User Role
                </label>
                <select
                  id="default_user_role"
                  name="default_user_role"
                  value={settings?.default_user_role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Limits</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="max_internships_per_company" className="block text-sm font-medium text-gray-700">
                  Maximum Internships per Company
                </label>
                <input
                  type="number"
                  id="max_internships_per_company"
                  name="max_internships_per_company"
                  value={settings?.max_internships_per_company}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="max_applications_per_student" className="block text-sm font-medium text-gray-700">
                  Maximum Applications per Student
                </label>
                <input
                  type="number"
                  id="max_applications_per_student"
                  name="max_applications_per_student"
                  value={settings?.max_applications_per_student}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 