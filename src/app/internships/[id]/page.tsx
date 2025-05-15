"use client"

import InternshipDetails from './InternshipDetails';
import React from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  return <InternshipDetails internshipId={resolvedParams.id} />;
} 
