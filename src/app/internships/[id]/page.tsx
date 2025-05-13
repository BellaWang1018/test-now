"use client"
import InternshipDetails from './InternshipDetails';

import React from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <InternshipDetails internshipId={resolvedParams.id} />;
} 
