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
  application_status?: 'applied' | 'interviewing' | 'offered' | 'rejected';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link 
              href={`/internships/${internship.id}`}
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
              {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
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
            href={`/internships/${internship.id}/apply`}
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

export default function InternshipsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
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
        if (filters.min_salary) queryParams.append('min_salary', filters.min_salary.toString());
        if (filters.visa.opt) queryParams.append('accepts_opt', 'true');
        if (filters.visa.cpt) queryParams.append('accepts_cpt', 'true');
        if (filters.certificate) queryParams.append('offers_certificate', 'true');

        const response = await fetch(`${API_URL}/api/internships?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch internships');
        }

        const { data } = await response.json();
        setInternships(data);
      } catch (error) {
        console.error('Error fetching internships:', error);
        setError('Failed to load internships');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [mounted, filters]);

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
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Find Your Next Internship</h1>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search by title or company..."
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
                value={filters.location}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter location..."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>

            <div>
              <label htmlFor="min_salary" className="block text-sm font-medium text-gray-700">
                Minimum Salary
              </label>
              <input
                type="number"
                id="min_salary"
                name="min_salary"
                value={filters.min_salary}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter minimum salary..."
              />
            </div>

            <div>
              <label htmlFor="date_range" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                id="date_range"
                name="date_range"
                value={filters.date_range}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Support
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.visa.opt}
                      onChange={() => handleVisaFilterChange('opt')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">OPT</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={filters.visa.cpt}
                      onChange={() => handleVisaFilterChange('cpt')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">CPT</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.certificate}
                    onChange={handleCertificateFilterChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Offers Certificate</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Internships List */}
        <div className="grid grid-cols-1 gap-6">
          {internships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No internships found matching your criteria.</p>
            </div>
          ) : (
            internships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 