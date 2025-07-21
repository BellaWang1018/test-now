"use client"

import React from 'react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-28 pb-20 bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-blue-700 mb-4 leading-tight">Your First Intern Starts Here</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Internships & Jobs for Students and Grads</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        <span className="font-semibold text-blue-600">First Interns</span> connects ambitious students and recent grads with startups and growing companies. International students? <span className="font-semibold text-green-600">See sponsorship options instantly!</span>
                    </p>
                </div>
            </section>

            {/* Special Highlight Banner */}
            <section className="bg-blue-100 py-8 border-t border-b border-blue-200">
                <div className="max-w-4xl mx-auto text-center text-blue-800 font-bold text-lg tracking-wide">
                    Empowering students to launch their careers. Helping startups and small businesses grow with fresh talent.
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">Why First Interns?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Students Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-blue-500">
                            <h3 className="text-xl font-bold text-blue-700 mb-2">For Students</h3>
                            <p className="text-gray-700 mb-4 text-center">Land your first internship or job with companies that value your potential.</p>
                            <ul className="space-y-2 text-gray-600 text-base">
                                <li>🔍 Search by sponsorship (OPT/CPT/H1B)</li>
                                <li>🎓 Perfect for high school, university, and grad students</li>
                                <li>🚀 Get noticed by startups & SMBs</li>
                            </ul>
                        </div>
                        {/* Companies Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-green-500">
                            <h3 className="text-xl font-bold text-green-700 mb-2">For Companies</h3>
                            <p className="text-gray-700 mb-4 text-center">Find passionate students and grads ready to make an impact.</p>
                            <ul className="space-y-2 text-gray-600 text-base">
                                <li>🏢 Tailored for startups & SMBs</li>
                                <li>💡 Attract fresh, motivated talent</li>
                                <li>🌍 Highlight sponsorship options</li>
                            </ul>
                        </div>
                        {/* International Friendly Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-t-4 border-purple-500">
                            <h3 className="text-xl font-bold text-purple-700 mb-2">International Friendly</h3>
                            <p className="text-gray-700 mb-4 text-center">We make it easy for international students to find the right fit.</p>
                            <ul className="space-y-2 text-gray-600 text-base">
                                <li>🌐 Sponsorship badges on every listing</li>
                                <li>✅ Apply with confidence</li>
                                <li>🤝 Direct company connections</li>
                            </ul>
                        </div>
                    </div>
                    {/* Registration buttons */}
                    <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-6">
                        <Link
                            href="/register/student"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md"
                        >
                            Register as Student
                        </Link>
                        <span className="text-gray-500 font-medium">or</span>
                        <Link
                            href="/register/company"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-md"
                        >
                            Register as Company
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white border-t border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Students How It Works */}
                        <div className="bg-blue-50 rounded-2xl shadow p-8 flex flex-col items-start">
                            <h3 className="text-xl font-bold text-blue-700 mb-4">For Students</h3>
                            <div className="space-y-4 text-gray-700 text-base">
                                <div><span className="font-bold text-blue-600">1.</span> Create your profile</div>
                                <div><span className="font-bold text-blue-600">2.</span> Browse internships & jobs</div>
                                <div><span className="font-bold text-blue-600">3.</span> Filter by sponsorship & company type</div>
                                <div><span className="font-bold text-blue-600">4.</span> Apply and track your progress</div>
                            </div>
                        </div>
                        {/* Companies How It Works */}
                        <div className="bg-green-50 rounded-2xl shadow p-8 flex flex-col items-start">
                            <h3 className="text-xl font-bold text-green-700 mb-4">For Companies</h3>
                            <div className="space-y-4 text-gray-700 text-base">
                                <div><span className="font-bold text-green-600">1.</span> Post internships & entry-level jobs</div>
                                <div><span className="font-bold text-green-600">2.</span> Highlight sponsorship options</div>
                                <div><span className="font-bold text-green-600">3.</span> Connect directly with candidates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-green-500">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
                    <div className="text-white text-2xl font-bold text-center md:text-left">Ready to get started?</div>
                    <Link
                        href="/register/student"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-blue-700 bg-white hover:bg-blue-100 transition-colors duration-200 shadow-md"
                    >
                        Register as Student
                    </Link>
                    <span className="text-white font-semibold">or</span>
                    <Link
                        href="/register/company"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-green-700 bg-white hover:bg-green-100 transition-colors duration-200 shadow-md"
                    >
                        Register as Company
                    </Link>
                </div>
            </section>
        </div>
    );
}
