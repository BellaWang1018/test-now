"use client"

import React, { useState, useEffect } from 'react';
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
}

interface AuthJobCardProps {
  internship: Internship;
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
  min_salary: number | '';
  visa: {
    opt: boolean;
    cpt: boolean;
  };
  certificate: boolean;
}

const AuthJobCard: React.FC<AuthJobCardProps> = ({ internship }) => {
  // Calculate how long ago the internship was posted
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/student/dashboard/jobs/${internship.id}`}>
              <h3 className="text-xl font-semibold text-blue-600 mb-1 hover:underline">
                {internship.title}
              </h3>
            </Link>
            <p className="text-gray-600 mb-1">{internship.company.name}</p>
            <p className="text-gray-500 text-sm mb-2">{internship.location}</p>
            
            {/* Salary and posted date */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-green-600 font-medium">
                ${internship.salary_min?.toLocaleString() || '0'} - ${internship.salary_max?.toLocaleString() || '0'} / year
              </span>
              <span className="text-gray-500">
                Posted {getTimeAgo(internship.created_at)}
              </span>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {internship.type}
              </span>
              {internship.accepts_opt && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Accepts OPT
                </span>
              )}
              {internship.accepts_cpt && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Accepts CPT
                </span>
              )}
              {internship.offers_certificate && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Certificate
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                internship.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : internship.status === 'filled' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {(internship.status || 'pending').charAt(0).toUpperCase() + (internship.status || 'pending').slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-3 mt-4">
          <Link 
            href={`/student/dashboard/jobs/${internship.id}`} 
            className="flex-1 bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-center hover:bg-blue-50 transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/student/dashboard/jobs/${internship.id}/apply`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function StudentJobs() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    status: '',
    date_range: '',
    min_salary: '',
    visa: {
      opt: false,
      cpt: false
    },
    certificate: false
  });

  // Initial mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        await fetchInternships(authToken);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndFetchData();
  }, [mounted, router]);

  // Effect for fetching data when filters or page changes
  useEffect(() => {
    if (!mounted) return;
    
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      fetchInternships(authToken);
    }
  }, [mounted, filters, currentPage]);

  const fetchInternships = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_range) params.append('date_range', filters.date_range);
      if (filters.min_salary) params.append('min_salary', filters.min_salary.toString());
      if (filters.visa.opt) params.append('accepts_opt', 'true');
      if (filters.visa.cpt) params.append('accepts_cpt', 'true');
      if (filters.certificate) params.append('offers_certificate', 'true');
      params.append('page', currentPage.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/student/internships?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch internships');
      }
      
      const data = await response.json();
      setInternships(data.data || []);
      setTotalPages(data.last_page);
    } catch (error) {
      console.error('Error fetching internships:', error);
      setError('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleVisaFilterChange = (type: 'opt' | 'cpt') => {
    setFilters(prev => ({
      ...prev,
      visa: {
        ...prev.visa,
        [type]: !prev.visa[type]
      }
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCertificateFilterChange = () => {
    setFilters(prev => ({
      ...prev,
      certificate: !prev.certificate
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      status: '',
      date_range: '',
      min_salary: '',
      visa: {
        opt: false,
        cpt: false
      },
      certificate: false
    });
    setCurrentPage(1);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Search</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Filters */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title, company..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City, state, or remote"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Posted
              </label>
              <select
                name="date_range"
                value={filters.date_range}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Any Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            {/* Minimum Salary */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary
              </label>
              <input
                type="number"
                name="min_salary"
                value={filters.min_salary}
                onChange={handleFilterChange}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Visa Requirements */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Requirements
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.visa.opt}
                    onChange={() => handleVisaFilterChange('opt')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Accepts OPT</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.visa.cpt}
                    onChange={() => handleVisaFilterChange('cpt')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Accepts CPT</span>
                </label>
              </div>
            </div>
            
            {/* Certificate */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.certificate}
                  onChange={handleCertificateFilterChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Offers Certificate</span>
              </label>
            </div>
            
            {/* Filter Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="md:col-span-7">
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {internships.length > 0 ? (
                <>
                  {internships.map((internship) => (
                    <AuthJobCard key={internship.id} internship={internship} />
                  ))}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search filters to find more opportunities.
                  </p>
                  <button 
                    onClick={resetFilters} 
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 