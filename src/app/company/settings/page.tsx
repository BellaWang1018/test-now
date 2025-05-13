"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CompanyUser {
  id: string;
  email: string;
  role: 'company';
  companyLogo?: string;
  created_at: string;
  updated_at: string;
}

export default function CompanySettings() {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState<{
    companyName: string;
    industry: string;
    description: string;
    website: string;
    linkedin: string;
    size: string;
    location: string;
    workEmail: string;
    legalName: string;
  }>({
    companyName: '',
    industry: '',
    description: '',
    website: '',
    linkedin: '',
    size: '',
    location: '',
    workEmail: '',
    legalName: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (!authToken || !userData) {
        router.push('/auth/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      
      // Check if the user is a company
      if (parsedUser.role !== 'company') {
        router.push('/student/dashboard');
        return;
      }
      
      setUser(parsedUser);
      
      // Fetch profile data
      fetchProfileData(authToken);
      
      setLoading(false);
    } catch (e) {
      console.error('Error loading user data', e);
      router.push('/auth/login');
    }
  }, [router, mounted]);

  const fetchProfileData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      
      setProfileForm({
        companyName: data.profile?.company_name || '',
        industry: data.profile?.industry || '',
        description: data.profile?.description || '',
        website: data.profile?.website || '',
        linkedin: data.profile?.linkedin || '',
        size: data.profile?.company_size || '',
        location: data.profile?.location || '',
        workEmail: data.profile?.work_email || '',
        legalName: data.profile?.legal_name || ''
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            company_name: profileForm.companyName,
            industry: profileForm.industry,
            description: profileForm.description,
            website: profileForm.website,
            linkedin: profileForm.linkedin,
            company_size: profileForm.size,
            location: profileForm.location,
            work_email: profileForm.workEmail,
            legal_name: profileForm.legalName
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Settings navigation items
  const settingsSections = [
    { id: 'profile', label: 'Company Profile', icon: 'building' },
  ];

  // Render the appropriate form based on the active section
  const renderSettingsContent = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Company Profile</h2>
        <form onSubmit={handleSaveProfile}>
          {/* Company Logo */}
          <div className="mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  {user?.companyLogo ? (
                    <Image 
                      src={user.companyLogo} 
                      alt="Company Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div>
                <h3 className="font-medium">Company Logo</h3>
                <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size 800K</p>
              </div>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              type="text"
              name="companyName"
              value={profileForm.companyName}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input 
                type="text"
                name="industry"
                value={profileForm.industry}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Technology, Finance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                type="text"
                name="location"
                value={profileForm.location}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <input 
                type="text"
                name="size"
                value={profileForm.size}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 11-50 employees"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
              <input 
                type="email"
                name="workEmail"
                value={profileForm.workEmail}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., contact@company.com"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
            <input 
              type="text"
              name="legalName"
              value={profileForm.legalName}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Legal company name for contracts"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
            <textarea 
              name="description"
              value={profileForm.description}
              onChange={handleProfileChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tell us about your company..."
              required
            />
          </div>
          
          {/* Social Links */}
          <h3 className="font-medium mb-4">Social Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input 
                type="url"
                name="website"
                value={profileForm.website}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input 
                type="url"
                name="linkedin"
                value={profileForm.linkedin}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Settings Navigation */}
              <div className="w-full md:w-64">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Settings Content */}
              <div className="flex-1">
                {renderSettingsContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 