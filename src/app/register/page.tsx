"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BackButton from '@/app/components/BackButton';

export default function Register() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Create your account</h1>
          <p className="mt-4 text-lg text-gray-600">
            Join First Interns and start your career journey today
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Student Registration */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">I&apos;m a Student</h2>
              <p className="mt-2 text-gray-600">Looking for internship opportunities</p>
            </div>

            <div className="space-y-4">
              <Link 
                href="/register/student" 
                className="block w-full py-3 px-4 text-center rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Sign up with Email
              </Link>
              
              <button 
                className="flex items-center justify-center w-full py-3 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => {/* TODO: Implement Google Sign In */}}
              >
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

          {/* Company Registration */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">I&apos;m a Company</h2>
              <p className="mt-2 text-gray-600">Looking to post internship opportunities</p>
            </div>

            <div className="space-y-4">
              <Link
                href="/register/company"
                className="block w-full py-3 px-4 text-center rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Sign up with Email
              </Link>
              
              <button
                className="flex items-center justify-center w-full py-3 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => {/* TODO: Implement Google Sign In */}}
              >
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 