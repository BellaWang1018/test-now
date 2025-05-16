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
  
  // State for internships
  const [internships, setInternships] = useState<Internship[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState<number | ''>('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [visaFilter, setVisaFilter] = useState<{opt: boolean, cpt: boolean}>({opt: false, cpt: false});
  const [certificateFilter, setCertificateFilter] = useState<boolean>(false);
  
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
        
        // Check if the user is a student
        if (parsedUserData.role !== 'student') {
          router.push('/company/dashboard');
          return;
        }
        
        await fetchInternships(authToken);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [mounted, router]);

  const fetchInternships = async (token: string) => {
    try {
      setLoading(true);
      
      // Build query parameters based on filters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (location) params.append('location', location);
      if (minSalary) params.append('salary_min', minSalary.toString());
      if (status) params.append('status', status);
      if (dateRange) params.append('date_range', dateRange);
      if (visaFilter.opt) params.append('accepts_opt', 'true');
      if (visaFilter.cpt) params.append('accepts_cpt', 'true');
      if (certificateFilter) params.append('offers_certificate', 'true');
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
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying new filters
    applyFilters();
  };

  const applyFilters = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchInternships(token);
    }
  };

  const handleVisaFilterChange = (type: 'opt' | 'cpt') => {
    setVisaFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleCertificateFilterChange = () => {
    setCertificateFilter(prev => !prev);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setLocation('');
    setMinSalary('');
    setStatus('');
    setDateRange('');
    setVisaFilter({ opt: false, cpt: false });
    setCertificateFilter(false);
    setCurrentPage(1);
    applyFilters();
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
      <h1 className="text-2xl font-bold mb-6">Job Search</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Filters */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <form onSubmit={handleFilterSubmit}>
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
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
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value ? parseInt(e.target.value) : '')}
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
                      checked={visaFilter.opt}
                      onChange={() => handleVisaFilterChange('opt')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Accepts OPT</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={visaFilter.cpt}
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
                    checked={certificateFilter}
                    onChange={handleCertificateFilterChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Offers Certificate</span>
                </label>
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
                  onClick={resetFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Results */}
        <div className="md:col-span-7">
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
                <p className="text-gray-500">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 