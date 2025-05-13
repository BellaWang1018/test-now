"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import PublicNavbar from './components/PublicNavbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Only hide the navbar on auth routes (login, register)
  const isAuthRoute = pathname?.startsWith('/auth');

  return (
    <>
      {!isAuthRoute && <PublicNavbar />}
      {children}
    </>
  );
} 