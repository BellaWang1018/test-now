"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

// Card component for displaying internships
const InternshipCard: React.FC<{ internship: Internship }> = ({ internship }) => {
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link 
            href={`/internships/${internship.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {internship.title}
          </Link>
          <p className="text-gray-600 mt-1">{internship.company.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          internship.status === 'open' ? 'bg-green-100 text-green-800' :
          internship.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {(internship.status || 'pending').charAt(0).toUpperCase() + (internship.status || 'pending').slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {internship.location}
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ${internship.salary_min?.toLocaleString()} - ${internship.salary_max?.toLocaleString()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {internship.accepts_opt && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">OPT</span>
        )}
        {internship.accepts_cpt && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">CPT</span>
        )}
        {internship.offers_certificate && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Certificate</span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Posted {getTimeAgo(internship.created_at)}</span>
        <Link 
          href={internship.status === 'open' ? 
            `/auth/login?redirect=/internships/${internship.id}/apply` : 
            '#'
          }
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
            internship.status === 'open'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {internship.status === 'open' ? 'Apply Now' : 'Closed'}
        </Link>
      </div>
    </div>
  );
};

export default function InternshipsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchInternships = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.date_range) queryParams.append('date_range', filters.date_range);
        if (filters.min_salary) queryParams.append('salary_min', filters.min_salary.toString());
        if (filters.visa.opt) queryParams.append('accepts_opt', 'true');
        if (filters.visa.cpt) queryParams.append('accepts_cpt', 'true');
        if (filters.certificate) queryParams.append('offers_certificate', 'true');
        
        // Add pagination parameters
        queryParams.append('page', currentPage.toString());

        const response = await fetch(`${API_URL}/api/internships?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch internships');
        }

        const data = await response.json();
        setInternships(data.data);
        setTotalPages(data.last_page);
        setTotalItems(data.total);
      } catch (error) {
        console.error('Error fetching internships:', error);
        setError('Failed to load internships');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [mounted, filters, currentPage]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleVisaFilterChange = (type: 'opt' | 'cpt') => {
    setFilters(prev => ({
      ...prev,
      visa: {
        ...prev.visa,
        [type]: !prev.visa[type]
      }
    }));
  };

  const handleCertificateFilterChange = () => {
    setFilters(prev => ({
      ...prev,
      certificate: !prev.certificate
    }));
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
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search internships..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Posted
                </label>
                <select
                  name="date_range"
                  value={filters.date_range}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Any Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              {/* Minimum Salary */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="min_salary"
                  value={filters.min_salary}
                  onChange={handleFilterChange}
                  placeholder="Enter minimum salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Visa Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.visa.opt}
                      onChange={() => handleVisaFilterChange('opt')}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Accepts OPT</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.visa.cpt}
                      onChange={() => handleVisaFilterChange('cpt')}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Accepts CPT</span>
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
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Offers Certificate</span>
                </label>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Available Internships</h1>
                <p className="text-gray-600 mt-2">
                  {totalItems} opportunities found
                </p>
              </div>
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Log in to track your applications
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Internships List */}
            <div className="space-y-4">
              {internships.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No internships found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search filters to find more opportunities.
                  </p>
                </div>
              ) : (
                <>
                  {internships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 