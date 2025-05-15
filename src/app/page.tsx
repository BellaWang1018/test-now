"use client"

import React from 'react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16">
                <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Find your dream</span>
                            <span className="block text-blue-600">internship today</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Connect with top companies and discover exciting internship opportunities that match your skills and interests.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent"></div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Why Choose Frist Interns?
                        </h2>
                        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature boxes */}
                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-blue-600 text-5xl mb-6">🎯</div>
                                <h3 className="text-xl font-semibold text-gray-900">Targeted Opportunities</h3>
                                <p className="mt-4 text-gray-600">
                                    Find internships that match your skills and career goals with our advanced matching system.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-blue-600 text-5xl mb-6">🤝</div>
                                <h3 className="text-xl font-semibold text-gray-900">Direct Connections</h3>
                                <p className="mt-4 text-gray-600">
                                    Connect directly with companies and receive personalized feedback on your applications.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-blue-600 text-5xl mb-6">📈</div>
                                <h3 className="text-xl font-semibold text-gray-900">Career Growth</h3>
                                <p className="mt-4 text-gray-600">
                                    Build your professional network and gain valuable experience to boost your career.
                                </p>
                            </div>
                        </div>
                        
                        {/* Registration buttons */}
                        <div className="mt-12">
                            <div className="flex flex-row justify-center gap-4">
                                <Link
                                    href="/auth/register/student"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                    Register as Student
                                </Link>
                                <Link
                                    href="/auth/register/company"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                    Register as Company
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            See How It Works
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Discover how students and companies benefit from InternHub
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Students</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">1</span>
                                        <span className="text-gray-600">Create your profile and showcase your skills</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">2</span>
                                        <span className="text-gray-600">Browse and apply to internships that match your interests</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">3</span>
                                        <span className="text-gray-600">Track your applications and receive feedback</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Companies</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">1</span>
                                        <span className="text-gray-600">Post internship opportunities and requirements</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">2</span>
                                        <span className="text-gray-600">Review applications and connect with candidates</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">3</span>
                                        <span className="text-gray-600">Manage your hiring process efficiently</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
                                        <svg className="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        <span className="text-white text-2xl font-semibold text-center">Internship Platform Demo</span>
                                        <p className="text-blue-100 mt-2 text-center">See how our platform connects students and companies</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
