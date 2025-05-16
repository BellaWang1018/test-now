"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

interface Company {
  id: number;
  name: string;
  industry: string;
  description: string;
  website: string;
  linkedin: string;
  company_size: string;
  location: string;
  work_email: string;
  legal_name: string;
  logo_path: string | null;
}

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const response = await axios.get(`${API_URL}/api/company/${resolvedParams.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.data || !response.data.data) {
          throw new Error('Invalid response format');
        }

        // Transform the data to match our interface
        const companyData = response.data.data;
        setCompany({
          id: companyData.id,
          name: companyData.name,
          industry: companyData.industry,
          description: companyData.description,
          website: companyData.website,
          linkedin: companyData.linkedin || '',
          company_size: companyData.company_size,
          location: companyData.location || '',
          work_email: companyData.work_email,
          legal_name: companyData.legal_name,
          logo_path: companyData.logo_path
        });
      } catch (error: unknown) {
        console.error('Error fetching company details:', error);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError(error instanceof Error ? error.message : 'Failed to fetch company details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || 'Company not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {company.logo_path ? (
                <div className="relative w-16 h-16">
                  <Image
                    src={company.logo_path}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">{company.industry}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">About</h4>
              <p className="text-gray-600">{company.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Company Information</h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.legal_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.company_size}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Work Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.work_email}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Links</h4>
                <div className="space-y-4">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  )}
                  {company.linkedin && (
                    <a
                      href={company.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 