"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define TypeScript interfaces
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

interface User {
  id: string;
  email: string;
  role: 'student' | 'company';
  name?: string;
}

interface Filters {
  search: string;
  location: string;
  status: string;
  date_range: string;
}

// Card component for displaying internships
const InternshipCard: React.FC<{ internship: Internship }> = ({ internship }) => {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link 
              href={`/student/dashboard/internships/${internship.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-150"
            >
              {internship.title}
            </Link>
            <p className="mt-1 text-sm text-gray-600">{internship.company.name}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              internship.status === 'open' ? 'bg-green-100 text-green-800' :
              internship.status === 'closed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {(internship.status || 'pending').charAt(0).toUpperCase() + (internship.status || 'pending').slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {internship.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${internship.salary_min?.toLocaleString()} - ${internship.salary_max?.toLocaleString()}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Application deadline: {new Date(internship.application_deadline).toLocaleDateString()}
          </span>
          <Link 
            href={`/student/dashboard/internships/${internship.id}/apply`}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              internship.status === 'open' && !internship.application_status
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {internship.application_status ? 'View Application' : 'Apply Now'}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Add new ResultsList component
const ResultsList: React.FC<{
  internships: Internship[];
  appliedFilters: {
    search: string;
    location: string;
    status: string;
    date_range: string;
  };
  error: string | null;
  onReset: () => void;
  isLoading: boolean;
}> = ({ internships, appliedFilters, error, onReset, isLoading }) => {
  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-7">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-7">
      {/* Results Stats */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-gray-600">
          Showing {internships.length} {internships.length === 1 ? 'result' : 'results'}
          {appliedFilters.search && ` for "${appliedFilters.search}"`}
          {appliedFilters.location && ` in "${appliedFilters.location}"`}
          {appliedFilters.status && ` with status "${appliedFilters.status}"`}
          {appliedFilters.date_range && ` posted in the last ${appliedFilters.date_range === '7days' ? '7 days' : appliedFilters.date_range === '30days' ? '30 days' : '3 months'}`}
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Internships List */}
      <div className="space-y-6">
        {internships.length > 0 ? (
          internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search filters to find more opportunities.
            </p>
            <button 
              onClick={onReset} 
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Add new FiltersSidebar component
const FiltersSidebar: React.FC<{
  searchQuery: string;
  locationFilter: string;
  statusFilter: string;
  dateRangeFilter: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  isSearching: boolean;
}> = ({
  searchQuery,
  locationFilter,
  statusFilter,
  dateRangeFilter,
  onSearchChange,
  onLocationChange,
  onStatusChange,
  onDateRangeChange,
  onApply,
  onReset,
  isSearching
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      e.preventDefault();
      onApply();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSearching) {
      onApply();
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 bg-white p-5 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
      
      {/* Search Query */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by title, company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          <div className="absolute left-3 top-2.5">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Location Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter location..."
          value={locationFilter}
          onChange={(e) => onLocationChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
        />
      </div>
      
      {/* Status Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={isSearching}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="filled">Filled</option>
        </select>
      </div>
      
      {/* Date Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Posted Within</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={dateRangeFilter}
          onChange={(e) => onDateRangeChange(e.target.value)}
          disabled={isSearching}
        >
          <option value="">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 3 Months</option>
        </select>
      </div>
      
      {/* Filter Actions */}
      <div className="space-y-3">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default function StudentInternships() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    search: '',
    location: '',
    status: '',
    date_range: ''
  });
  
  // Initial mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchInternships = useCallback(async (filters: Filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_range) params.append('date_range', filters.date_range);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/internships/my?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch internships');
      }

      const data = await response.json();
      if (!data.applications) {
        throw new Error('Invalid response format');
      }
      
      setInternships(data.applications);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Authentication and data fetching effect
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
        
        const parsedUserData = JSON.parse(userData) as User;
        
        if (parsedUserData.role !== 'student') {
          router.push('/company/dashboard');
          return;
        }
        
        await fetchInternships(appliedFilters);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndFetchData();
  }, [mounted, router, fetchInternships, appliedFilters]);

  const applyFilters = useCallback(async (newFilters: Filters) => {
    setAppliedFilters(newFilters);
    await fetchInternships(newFilters);
  }, [fetchInternships]);

  const handleTextInputChange = useCallback((
    type: 'search' | 'location',
    value: string
  ) => {
    if (type === 'search') setSearchQuery(value);
    else setLocationFilter(value);
  }, []);

  const handleSelectionChange = useCallback((
    type: 'status' | 'date_range',
    value: string
  ) => {
    if (type === 'status') setStatusFilter(value);
    else setDateRangeFilter(value);
  }, []);

  const handleApplyFilters = useCallback(async () => {
    const newFilters = {
      search: searchQuery,
      location: locationFilter,
      status: statusFilter,
      date_range: dateRangeFilter
    };
    await applyFilters(newFilters);
  }, [searchQuery, locationFilter, statusFilter, dateRangeFilter, applyFilters]);

  const resetFilters = useCallback(async () => {
    setSearchQuery('');
    setLocationFilter('');
    setStatusFilter('');
    setDateRangeFilter('');
    
    const newFilters = {
      search: '',
      location: '',
      status: '',
      date_range: ''
    };
    await applyFilters(newFilters);
  }, [applyFilters]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Filters Sidebar */}
        <FiltersSidebar
          searchQuery={searchQuery}
          locationFilter={locationFilter}
          statusFilter={statusFilter}
          dateRangeFilter={dateRangeFilter}
          onSearchChange={(value) => handleTextInputChange('search', value)}
          onLocationChange={(value) => handleTextInputChange('location', value)}
          onStatusChange={(value) => handleSelectionChange('status', value)}
          onDateRangeChange={(value) => handleSelectionChange('date_range', value)}
          onApply={handleApplyFilters}
          onReset={resetFilters}
          isSearching={false}
        />
        
        {/* Results List */}
        <ResultsList
          internships={internships}
          appliedFilters={{
            search: searchQuery,
            location: locationFilter,
            status: statusFilter,
            date_range: dateRangeFilter,
          }}
          error={error}
          onReset={resetFilters}
          isLoading={false}
        />
      </div>
    </div>
  );
} 