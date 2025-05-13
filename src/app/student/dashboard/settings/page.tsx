"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'student' | 'company';
  name?: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  bio: string;
  website: string;
  github: string;
  linkedin: string;
  university: string;
  major: string;
  graduationYear: string;
  skills: string[];
}

interface ProfileData {
  user: {
    name: string;
  };
  profile?: {
    headline?: string;
    location?: string;
    bio?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    university?: string;
    major?: string;
    graduation_year?: string;
    skills?: string[];
  };
}

export default function StudentSettings() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    bio: '',
    website: '',
    github: '',
    linkedin: '',
    university: '',
    major: '',
    graduationYear: '',
    skills: []
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfileData = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json() as ProfileData;
      
      // Split name into first and last name
      const nameParts = data.user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfileForm({
        firstName,
        lastName,
        headline: data.profile?.headline || '',
        location: data.profile?.location || '',
        bio: data.profile?.bio || '',
        website: data.profile?.website || '',
        github: data.profile?.github || '',
        linkedin: data.profile?.linkedin || '',
        university: data.profile?.university || '',
        major: data.profile?.major || '',
        graduationYear: data.profile?.graduation_year || '',
        skills: data.profile?.skills || []
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuthAndFetchData = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        if (!authToken || !userData) {
          router.push('/auth/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData) as User;
        
        // Check if the user is a student
        if (parsedUser.role !== 'student') {
          router.push('/company/dashboard');
          return;
        }
        
        await fetchProfileData(authToken);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndFetchData();
  }, [mounted, router, fetchProfileData]);

  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No auth token found');
      }

      const requestBody = {
        name: `${profileForm.firstName} ${profileForm.lastName}`,
        university: profileForm.university,
        major: profileForm.major,
        bio: profileForm.bio,
        skills: profileForm.skills,
        graduation_year: profileForm.graduationYear,
        location: profileForm.location,
        website: profileForm.website,
        github: profileForm.github,
        linkedin: profileForm.linkedin,
        headline: profileForm.headline
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        throw new Error('Failed to update profile');
      }
      
      const responseData = await response.json();
      console.log('Profile update response:', responseData);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  }, [profileForm]);
  
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Settings navigation items
  const settingsSections = [
    { id: 'profile', label: 'Profile Information', icon: 'user' },
  ];

  // Render the appropriate form based on the active section
  const renderSettingsContent = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        <form onSubmit={handleSaveProfile}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
            <input 
              type="text"
              name="headline"
              value={profileForm.headline}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Computer Science Student at Stanford University"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              type="text"
              name="location"
              value={profileForm.location}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <input 
                type="text"
                name="university"
                value={profileForm.university}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Stanford University"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input 
                type="text"
                name="major"
                value={profileForm.major}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
            <input 
              type="text"
              name="graduationYear"
              value={profileForm.graduationYear}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., 2024"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea 
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input 
              type="text"
              name="skills"
              value={profileForm.skills.join(', ')}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                skills: e.target.value.split(',').map(skill => skill.trim())
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., JavaScript, React, Node.js"
            />
            <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input 
                type="url"
                name="website"
                value={profileForm.website}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://your-website.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input 
                type="url"
                name="github"
                value={profileForm.github}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input 
              type="url"
              name="linkedin"
              value={profileForm.linkedin}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{renderIcon(section.icon)}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 