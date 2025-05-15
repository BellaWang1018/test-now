"use client"

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface InternshipCardProps {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  duration: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  createdAt: string;
  description: string;
}

export default function InternshipCard({
  id,
  title,
  company,
  location,
  type,
  duration,
  salary,
  skills,
  createdAt,
  description,
}: InternshipCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/internships/${id}`}
              className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
            >
              {title}
            </Link>
            <div className="mt-2 flex items-center">
              {company.logo && (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="h-8 w-8 rounded-full mr-3"
                />
              )}
              <span className="text-gray-600">{company.name}</span>
            </div>
          </div>
          <div className="ml-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {location}
          </div>
          <div className="flex items-center text-gray-600">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {duration}
          </div>
        </div>

        {salary && (
          <div className="mt-4 flex items-center text-gray-600">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {salary.currency}
            {salary.min.toLocaleString()} - {salary.currency}
            {salary.max.toLocaleString()}
          </div>
        )}

        <div className="mt-4">
          <p className="text-gray-600 line-clamp-2">{description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          <Link
            href={`/internships/${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 