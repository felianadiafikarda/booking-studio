import React from 'react';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingStepper from '@/components/BookingStepper';
import { getCurrentUser } from '@/lib/auth';

export default async function BookingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?redirect=/booking/${encodeURIComponent(slug)}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <main className="flex-1">
        <BookingStepper initialSlug={slug} />
      </main>
      <Footer />
    </div>
  );
}
