"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the schema shape first
const internshipFormSchema = {
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  accepts_opt: z.literal(true).or(z.literal(false)),
  accepts_cpt: z.literal(true).or(z.literal(false)),
  offers_certificate: z.literal(true).or(z.literal(false)),
  hard_requirements: z.string().optional(),
  application_deadline: z.string().min(1, 'Application deadline is required'),
} as const;

// Create the schema from the shape
const internshipSchema = z.object(internshipFormSchema);

// Infer the type from the schema
type InternshipFormData = z.infer<typeof internshipSchema>;

export default function NewInternship() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InternshipFormData>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      accepts_opt: false,
      accepts_cpt: false,
      offers_certificate: false,
    }
  });

  const onSubmit = async (data: InternshipFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/company/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          salary_min: data.salary_min ? parseFloat(data.salary_min) : null,
          salary_max: data.salary_max ? parseFloat(data.salary_max) : null,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to post internship');
      }
      
      router.push('/company/internships');
    } catch (err) {
      console.error('Error posting internship:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while posting the internship');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Internship</h1>
          <p className="mt-3 text-xl text-gray-500">
            Fill out the form below to create a new internship opportunity
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Internship Title</label>
              <input
                {...register('title')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g. Software Engineering Intern"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                placeholder="Describe the internship responsibilities, projects, and what interns will learn"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                {...register('location')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g. San Francisco, CA or Remote"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Salary (Optional)</label>
                <input
                  {...register('salary_min')}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g. 25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Salary (Optional)</label>
                <input
                  {...register('salary_max')}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g. 35000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
              <input
                {...register('application_deadline')}
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.application_deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.application_deadline.message}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Internship Qualifications</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Hard Requirements</label>
                <textarea
                  {...register('hard_requirements')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="List specific skills, coursework, or qualifications required"
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <input
                    id="accepts_opt"
                    {...register('accepts_opt')}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accepts_opt" className="ml-2 block text-sm text-gray-700">
                    Accepts OPT (Optional Practical Training)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="accepts_cpt"
                    {...register('accepts_cpt')}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accepts_cpt" className="ml-2 block text-sm text-gray-700">
                    Accepts CPT (Curricular Practical Training)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="offers_certificate"
                    {...register('offers_certificate')}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="offers_certificate" className="ml-2 block text-sm text-gray-700">
                    Offers Certificate of Completion
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                  isLoading ? 'opacity-50' : ''
                }`}
              >
                {isLoading ? 'Posting...' : 'Post Internship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 