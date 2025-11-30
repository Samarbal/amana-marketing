
'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { Users, UserCheck, TrendingUp, Target } from 'lucide-react';

export default function DemographicView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/marketing-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug: Log data structure
  useEffect(() => {
    if (data) {
      console.log('Data structure:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
    }
  }, [data]);

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  if (!data) return <div className="flex items-center justify-center h-screen text-white">No data available</div>;

  // === GENDER METRICS ===
  // The data is an object with campaigns array inside it
  const campaigns = Array.isArray(data) ? data : data?.campaigns || [];

  const totalClicksMale = campaigns
    .filter((item: any) => item.gender === "Male")
    .reduce((sum: number, item: any) => sum + (item.performance?.clicks || 0), 0);

  const totalClicksFemale = campaigns
    .filter((item: any) => item.gender === "Female")
    .reduce((sum: number, item: any) => sum + (item.performance?.clicks || 0), 0);

  const totalSpendMale = campaigns
    .filter((item: any) => item.gender === "Male")
    .reduce((sum: number, item: any) => sum + (item.performance?.spend || 0), 0);

  const totalSpendFemale = campaigns
    .filter((item: any) => item.gender === "Female")
    .reduce((sum: number, item: any) => sum + (item.performance?.spend || 0), 0);

  const totalRevenueMale = campaigns
    .filter((item: any) => item.gender === "Male")
    .reduce((sum: number, item: any) => sum + (item.performance?.revenue || 0), 0);

  const totalRevenueFemale = campaigns
    .filter((item: any) => item.gender === "Female")
    .reduce((sum: number, item: any) => sum + (item.performance?.revenue || 0), 0);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Debug Info */}
          <div className="mb-6 p-4 bg-gray-800 rounded text-white text-sm">
            <p>Data Type: {typeof data}</p>
            <p>Has campaigns: {String(Array.isArray(data?.campaigns))}</p>
            <p>Campaigns count: {campaigns.length}</p>
            <p>First campaign: {JSON.stringify(campaigns[0])?.substring(0, 200)}...</p>
          </div>

          {/* Gender Metrics Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardMetric title="Total Clicks (Male)" value={totalClicksMale} icon={<Users />} />
            <CardMetric title="Total Spend (Male)" value={totalSpendMale} icon={<TrendingUp />} />
            <CardMetric title="Total Revenue (Male)" value={totalRevenueMale} icon={<Target />} />
            <CardMetric title="Total Clicks (Female)" value={totalClicksFemale} icon={<Users />} />
            <CardMetric title="Total Spend (Female)" value={totalSpendFemale} icon={<TrendingUp />} />
            <CardMetric title="Total Revenue (Female)" value={totalRevenueFemale} icon={<Target />} />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

