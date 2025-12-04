"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';

import { Globe } from 'lucide-react';
import { BubbleMap } from "../../src/components/ui/bubble-map";

interface RegionalPerformance {
  region: string;
  country: string;
  revenue: number;
  spend: number;
}

interface Campaign {
  id: number;
  name: string;
  regional_performance: RegionalPerformance[];
}

export default function RegionView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/marketing-data');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('Fetched API data:', json);
        setData(json);
      } catch (err) {
        console.error('Failed to load regional data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aggregate regional data and prepare datasets: regionList (all regions) and mapData (only regions with coords)
  const { regionList, mapData } = useMemo(() => {
    if (!data?.campaigns) return { regionList: [], mapData: [] };

    const campaigns: Campaign[] = data.campaigns;
    const regionMap = new Map<string, any>();

    // Regional coordinates (approximate centers for major regions) - expanded list
    const regionCoords: Record<string, { lat: number; lng: number }> = {
      'North America': { lat: 45, lng: -95 },
      'South America': { lat: -15, lng: -60 },
      'Europe': { lat: 54, lng: 15 },
      'Africa': { lat: -8, lng: 34 },
      'Middle East': { lat: 20, lng: 57 },
      'Asia': { lat: 34, lng: 100 },
      'Southeast Asia': { lat: 15, lng: 107 },
      'Oceania': { lat: -27, lng: 133 },
      'UK': { lat: 54, lng: -3 },
      'Germany': { lat: 51, lng: 10 },
      'France': { lat: 46, lng: 2 },
      'USA': { lat: 39, lng: -98 },
      'Canada': { lat: 60, lng: -95 },
      'Japan': { lat: 36, lng: 138 },
      'India': { lat: 20, lng: 78 },
      'Australia': { lat: -25, lng: 133 },
      'Brazil': { lat: -14, lng: -51 },
      'Mexico': { lat: 23, lng: -102 },
      'Spain': { lat: 40, lng: -4 },
      'Italy': { lat: 41, lng: 12 },
      'Netherlands': { lat: 52, lng: 5 },
      'Sweden': { lat: 60, lng: 18 },
      'South Korea': { lat: 37, lng: 127 },
      'Singapore': { lat: 1, lng: 104 },
      'Thailand': { lat: 15, lng: 101 },
      'Vietnam': { lat: 16, lng: 107 },
      'Philippines': { lat: 12, lng: 122 },
      'Indonesia': { lat: -2, lng: 113 },
      'Malaysia': { lat: 4, lng: 102 },
      'Hong Kong': { lat: 22, lng: 114 },
      'China': { lat: 35, lng: 105 },
      'Taiwan': { lat: 24, lng: 121 },
      'Pakistan': { lat: 30, lng: 69 },
      'Bangladesh': { lat: 24, lng: 90 },
      'Turkey': { lat: 39, lng: 35 },
      'UAE': { lat: 24, lng: 54 },
      'United Arab Emirates': { lat: 24, lng: 54 },
      'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
      'Dubai': { lat: 25.2048, lng: 55.2708 },
      'Sharjah': { lat: 25.3463, lng: 55.4209 },
      'Doha': { lat: 25.2854, lng: 51.5310 },
      'Riyadh': { lat: 24.7136, lng: 46.6753 },
      'Saudi Arabia': { lat: 24, lng: 45 },
      'Egypt': { lat: 26, lng: 29 },
      'South Africa': { lat: -30, lng: 22 },
      'Nigeria': { lat: 9, lng: 8 },
      'Kenya': { lat: -1, lng: 36 },
      'Poland': { lat: 52, lng: 19 },
      'Belgium': { lat: 50, lng: 4 },
      'Switzerland': { lat: 47, lng: 8 },
    };

    campaigns.forEach((campaign) => {
      if (!campaign.regional_performance) return;

      campaign.regional_performance.forEach((region) => {
        const key = region.region;
        const existing = regionMap.get(key);

        if (existing) {
          existing.revenue += region.revenue ?? 0;
          existing.spend += region.spend ?? 0;
        } else {
          regionMap.set(key, {
            region: region.region,
            country: region.country,
            revenue: region.revenue ?? 0,
            spend: region.spend ?? 0,
          });
        }
      });
    });

    // Build a region list (all aggregated regions) and a filtered mapData with coordinates
    const regionList = Array.from(regionMap.values()).map((region) => ({
      region: region.region,
      country: region.country,
      revenue: region.revenue,
      spend: region.spend,
      value: (region.revenue ?? 0) + (region.spend ?? 0),
      performance: region.revenue > 0 ? region.revenue / (region.spend || 1) : 0,
    })).filter(r => r.value > 0);

    const mapData = regionList.map((r) => {
      // prefer exact region match, fallback to country match when region isn't in coords map
      const coords = regionCoords[r.region] ?? regionCoords[r.country as string];
      return {
        city: r.region,
        lat: coords?.lat ?? 0,
        lng: coords?.lng ?? 0,
        value: r.value,
        performance: r.performance,
      };
    }).filter(item => item.lat !== 0 && item.lng !== 0);

    console.log('Raw regionMap:', Array.from(regionMap.entries()));
    console.log('Region list (for cards):', regionList);
    console.log('Map data (with coords):', mapData);

    return { regionList, mapData };
  }, [data]);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-2">
                <Globe className="h-8 w-8" />
                Global Campaign Map
              </h1>
              <p className="text-gray-300 mt-2">Campaign reach worldwide (bubble size = combined revenue + spend)</p>
            </div>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading && <p className="text-white text-xl text-center">Loading global campaign data…</p>}
          {error && <p className="text-red-400 text-center">Error: {error}</p>}

          {!loading && !error && (regionList?.length ?? 0) > 0 && (
            <div className="space-y-8">
              
              {/* SECTION 1: The Interactive World Map */}
              <div className="w-full">
                {/* render map only if we have geographic points */}
                {mapData && mapData.length > 0 ? (
                  <BubbleMap data={mapData} />
                ) : (
                  <p className="text-gray-400 text-center">No geographic coordinates available for map view</p>
                )}
              </div>

              {/* SECTION 2: Detailed Cards Grid (Existing View) */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Regional Breakdown</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {regionList.map((region, idx) => {
                    const maxValue = Math.max(...regionList.map(d => d.value), 1);
                    const sizePercent = (region.value / maxValue) * 100;
                    const performanceColor = region.performance >= 2.5 ? 'bg-green-500' : region.performance >= 1 ? 'bg-yellow-500' : 'bg-red-500';
                    
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-gray-800 rounded-lg text-white text-center transform transition hover:scale-105 shadow-md border border-gray-700"
                      >
                        <div className="flex justify-center mb-3">
                          <div
                            className={`${performanceColor} rounded-full flex items-center justify-center text-white font-bold transition-all shadow-inner`}
                            style={{
                              width: `${Math.max(40, Math.min(sizePercent, 80))}px`, // Cap size for cards so they don't break layout
                              height: `${Math.max(40, Math.min(sizePercent, 80))}px`,
                            }}
                          >
                            {/* Only show initial if bubble is big enough */}
                            {sizePercent > 10 && region.region?.charAt(0)}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{region.region}</h3>
                        <p className="text-gray-400 text-sm">Value: ${region.value.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs mt-1">ROAS: {region.performance.toFixed(2)}x</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (regionList?.length ?? 0) === 0 && (
            <p className="text-gray-400 text-center">No regional campaign data available</p>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}