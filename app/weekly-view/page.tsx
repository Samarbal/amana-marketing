'use client';

import { useEffect, useState, useMemo } from "react";
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChartComponent } from "../../src/components/ui/line-chart";
import { Calendar } from "lucide-react";

interface WeeklyPerformance {
  week_start: string;
  week_end: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface Campaign {
  id: number;
  name: string;
  weekly_performance: WeeklyPerformance[];
}

export default function WeeklyView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  

     // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/marketing-data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch weekly data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   // Process weekly data
  const weeklyMetrics = useMemo(() => {
    if (!data?.campaigns) return [];

    const weekMap = new Map<string, any>();

    data.campaigns.forEach((campaign: Campaign) => {
      campaign.weekly_performance?.forEach((week) => {
        const key = week.week_start;
        const existing = weekMap.get(key);

        if (existing) {
          existing.spend += week.spend;
          existing.revenue += week.revenue;
        } else {
          const weekLabel = new Date(week.week_start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          weekMap.set(key, {
            week_label: weekLabel,
            spend: week.spend,
            revenue: week.revenue,
          });
        }
      });
    });

    return Array.from(weekMap.values()).sort(
      (a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        Loading weekly data...
      </div>
    );
  }


  
  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View

              </h1>
              <p>Profitability Analysis: Revenue vs Spend</p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Page content will go here */}

            {/* LOADING */}
          {loading && (
            <p className="text-white text-center text-xl">Loading weekly analytics…</p>
          )}

        {/* Chart */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-400" />
            Revenue vs Spend (Weekly)
          </h2>

          <LineChartComponent
            data={weeklyMetrics.map((week) => ({
              label: week.week_label,
              value: week.revenue,
            }))}
          />
        </div>



        </div>
        
        <Footer />
      </div>
    </div>
  );
}
