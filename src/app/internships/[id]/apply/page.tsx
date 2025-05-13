"use client"

import React from 'react';
import ApplyInternshipForm from './ApplyInternshipForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ApplyInternshipForm internshipId={resolvedParams.id} />;
} 