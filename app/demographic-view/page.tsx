'use client';
// Demographic View Page - Displays marketing campaign performance by gender and age group  
// import React 
import { useEffect, useState, useMemo } from 'react';

// import UI components
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
// icons 
import { Users, TrendingUp, Target, Eye, MousePointer, DollarSign } from 'lucide-react';

// types safety to fetched data
interface DemographicBreakdown {
  age_group: string;
  gender: string;
  percentage_of_audience: number;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
  };
}

interface Campaign {
  id: number;
  name: string;
  spend: number;
  revenue: number;
  demographic_breakdown: DemographicBreakdown[];
}

interface AgeGroupData {
  age_group: string;
  spend: number;
  revenue: number;
}

interface GenderAgeGroupData {
  age_group: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
}

// start of DemographicView component
export default function DemographicView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


// fectch marketing data from API route  
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


  // gender metrics calculation

  const genderMetrics = useMemo(() => {
    // check if data and campaigns exist
    if (!data?.campaigns) {
      return { male: { clicks: 0, impressions: 0, conversions: 0, spend: 0, revenue: 0 }, female: { clicks: 0, impressions: 0, conversions: 0, spend: 0, revenue: 0 } };
    }

    const campaigns: Campaign[] = data.campaigns;
  
    let maleClicks = 0, maleImpressions = 0, maleConversions = 0, maleSpend = 0, maleRevenue = 0;
    let femaleClicks = 0, femaleImpressions = 0, femaleConversions = 0, femaleSpend = 0, femaleRevenue = 0;

    campaigns.forEach((campaign) => {
      if (!campaign.demographic_breakdown) return;

      let malePct = 0, femalePct = 0;

      // sum performance by gender
      campaign.demographic_breakdown.forEach((demo) => {
        if (demo.gender === 'Male') {
          malePct += demo.percentage_of_audience;
          maleClicks += demo.performance?.clicks || 0;
          maleImpressions += demo.performance?.impressions || 0;
          maleConversions += demo.performance?.conversions || 0;
        } else if (demo.gender === 'Female') {
          femalePct += demo.percentage_of_audience;
          femaleClicks += demo.performance?.clicks || 0;
          femaleImpressions += demo.performance?.impressions || 0;
          femaleConversions += demo.performance?.conversions || 0;
        }
      });
 // allocate spend and revenue based on gender proportions
      const totalPct = malePct + femalePct;
      if (totalPct > 0) {
        maleSpend += (campaign.spend * malePct) / totalPct;
        maleRevenue += (campaign.revenue * malePct) / totalPct;
        femaleSpend += (campaign.spend * femalePct) / totalPct;
        femaleRevenue += (campaign.revenue * femalePct) / totalPct;
      }
    });

    return {
      male: { clicks: maleClicks, impressions: maleImpressions, conversions: maleConversions, spend: Math.round(maleSpend * 100) / 100, revenue: Math.round(maleRevenue) },
      female: { clicks: femaleClicks, impressions: femaleImpressions, conversions: femaleConversions, spend: Math.round(femaleSpend * 100) / 100, revenue: Math.round(femaleRevenue) }
    };
  }, [data]);


  // spend and revenue by age group calculation
  const ageGroupMetrics = useMemo(() => {
    if (!data?.campaigns) {
      return [];
    }

    const campaigns: Campaign[] = data.campaigns;
    const ageGroupMap: Map<string, { spend: number; revenue: number }> = new Map();

    campaigns.forEach((campaign) => {
      if (!campaign.demographic_breakdown) return;

      let totalPct = 0;
      // find total percentage 
      campaign.demographic_breakdown.forEach((demo) => {
        totalPct += demo.percentage_of_audience;
      });

      if (totalPct === 0) return;

      // allocate spend and revenue by age group
      campaign.demographic_breakdown.forEach((demo) => {
        const ageGroup = demo.age_group;
        const pctRatio = demo.percentage_of_audience / totalPct;

        const existing = ageGroupMap.get(ageGroup) || { spend: 0, revenue: 0 };
        ageGroupMap.set(ageGroup, {
          spend: existing.spend + (campaign.spend * pctRatio),
          revenue: existing.revenue + (campaign.revenue * pctRatio)
        });
      });
    });
 // Convert map to array and sort age groups numerically
    const result: AgeGroupData[] = [];
    ageGroupMap.forEach((value, key) => {
      result.push({
        age_group: key,
        spend: Math.round(value.spend * 100) / 100,
        revenue: Math.round(value.revenue)
      });
    });

    result.sort((a, b) => {
      const aStart = parseInt(a.age_group.split('-')[0]) || 0;
      const bStart = parseInt(b.age_group.split('-')[0]) || 0;
      return aStart - bStart;
    });

    return result;
  }, [data]);

// performance table data by  gender and age group
  
  const genderAgeGroupMetrics = useMemo(() => {
    if (!data?.campaigns) {
      return { male: [], female: [] };
    }

    const campaigns: Campaign[] = data.campaigns;
    const maleMap: Map<string, { impressions: number; clicks: number; conversions: number }> = new Map();
    const femaleMap: Map<string, { impressions: number; clicks: number; conversions: number }> = new Map();

    campaigns.forEach((campaign) => {
      if (!campaign.demographic_breakdown) return;

      campaign.demographic_breakdown.forEach((demo) => {
        const ageGroup = demo.age_group;
        const perf = demo.performance;

        if (demo.gender === 'Male') {
          const existing = maleMap.get(ageGroup) || { impressions: 0, clicks: 0, conversions: 0 };
          maleMap.set(ageGroup, {
            impressions: existing.impressions + (perf?.impressions || 0),
            clicks: existing.clicks + (perf?.clicks || 0),
            conversions: existing.conversions + (perf?.conversions || 0)
          });
        } else if (demo.gender === 'Female') {
          const existing = femaleMap.get(ageGroup) || { impressions: 0, clicks: 0, conversions: 0 };
          femaleMap.set(ageGroup, {
            impressions: existing.impressions + (perf?.impressions || 0),
            clicks: existing.clicks + (perf?.clicks || 0),
            conversions: existing.conversions + (perf?.conversions || 0)
          });
        }
      });
    });

    const processMap = (map: Map<string, { impressions: number; clicks: number; conversions: number }>): GenderAgeGroupData[] => {
      const result: GenderAgeGroupData[] = [];
      map.forEach((value, key) => {
        const ctr = value.impressions > 0 ? (value.clicks / value.impressions) * 100 : 0;
        const convRate = value.clicks > 0 ? (value.conversions / value.clicks) * 100 : 0;
        result.push({
          age_group: key,
          impressions: value.impressions,
          clicks: value.clicks,
          conversions: value.conversions,
          ctr: Math.round(ctr * 100) / 100,
          conversion_rate: Math.round(convRate * 100) / 100
        });
      });

      result.sort((a, b) => {
        const aStart = parseInt(a.age_group.split('-')[0]) || 0;
        const bStart = parseInt(b.age_group.split('-')[0]) || 0;
        return aStart - bStart;
      });

      return result;
    };

    return {
      male: processMap(maleMap),
      female: processMap(femaleMap)
    };
  }, [data]);


  // prepare chart data for spend and revenue by age group
  const spendChartData = useMemo(() => {
    return ageGroupMetrics.map((item, index) => ({
      label: item.age_group,
      value: item.spend,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
    }));
  }, [ageGroupMetrics]);

  const revenueChartData = useMemo(() => {
    return ageGroupMetrics.map((item, index) => ({
      label: item.age_group,
      value: item.revenue,
      color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'][index % 6]
    }));
  }, [ageGroupMetrics]);

  // define table columns for performance
  const tableColumns = [
    { key: 'age_group', header: 'Age Group', sortable: true, sortType: 'string' as const },
    { 
      key: 'impressions', 
      header: 'Impressions', 
      sortable: true, 
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'clicks', 
      header: 'Clicks', 
      sortable: true, 
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'conversions', 
      header: 'Conversions', 
      sortable: true, 
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'ctr', 
      header: 'CTR (%)', 
      sortable: true, 
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => `${value.toFixed(2)}%`
    },
    { 
      key: 'conversion_rate', 
      header: 'Conv. Rate (%)', 
      sortable: true, 
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => `${value.toFixed(2)}%`
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">No data available</div>
        </div>
      </div>
    );
  }
// main page layout
  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Demographic Insights
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Performance breakdown by gender and age group across all campaigns
              </p>
            </div>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-400" />
              Male Audience Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <CardMetric title="Impressions" value={genderMetrics.male.impressions.toLocaleString()} icon={<Eye className="h-5 w-5" />} />
              <CardMetric title="Clicks" value={genderMetrics.male.clicks.toLocaleString()} icon={<MousePointer className="h-5 w-5" />} />
              <CardMetric title="Conversions" value={genderMetrics.male.conversions.toLocaleString()} icon={<Target className="h-5 w-5" />} />
              <CardMetric title="Spend" value={`$${genderMetrics.male.spend.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
              <CardMetric title="Revenue" value={`$${genderMetrics.male.revenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} className="text-green-400" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-pink-400" />
              Female Audience Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <CardMetric title="Impressions" value={genderMetrics.female.impressions.toLocaleString()} icon={<Eye className="h-5 w-5" />} />
              <CardMetric title="Clicks" value={genderMetrics.female.clicks.toLocaleString()} icon={<MousePointer className="h-5 w-5" />} />
              <CardMetric title="Conversions" value={genderMetrics.female.conversions.toLocaleString()} icon={<Target className="h-5 w-5" />} />
              <CardMetric title="Spend" value={`$${genderMetrics.female.spend.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
              <CardMetric title="Revenue" value={`$${genderMetrics.female.revenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} className="text-green-400" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Gender Comparison
            </h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Click Distribution</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Male</span>
                        <span>{((genderMetrics.male.clicks / (genderMetrics.male.clicks + genderMetrics.female.clicks || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(genderMetrics.male.clicks / (genderMetrics.male.clicks + genderMetrics.female.clicks || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Female</span>
                        <span>{((genderMetrics.female.clicks / (genderMetrics.male.clicks + genderMetrics.female.clicks || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full" 
                          style={{ width: `${(genderMetrics.female.clicks / (genderMetrics.male.clicks + genderMetrics.female.clicks || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Revenue Distribution</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Male</span>
                        <span>{((genderMetrics.male.revenue / (genderMetrics.male.revenue + genderMetrics.female.revenue || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(genderMetrics.male.revenue / (genderMetrics.male.revenue + genderMetrics.female.revenue || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Female</span>
                        <span>{((genderMetrics.female.revenue / (genderMetrics.male.revenue + genderMetrics.female.revenue || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full" 
                          style={{ width: `${(genderMetrics.female.revenue / (genderMetrics.male.revenue + genderMetrics.female.revenue || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Spend & Revenue by Age Group
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <BarChart
                title="Total Spend by Age Group"
                data={spendChartData}
                height={280}
                formatValue={(value) => `$${value.toLocaleString()}`}
              />
              <BarChart
                title="Total Revenue by Age Group"
                data={revenueChartData}
                height={280}
                formatValue={(value) => `$${value.toLocaleString()}`}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-400" />
              Campaign Performance by Male Age Groups
            </h2>
            <Table
              columns={tableColumns}
              data={genderAgeGroupMetrics.male}
              maxHeight="350px"
              emptyMessage="No male demographic data available"
              defaultSort={{ key: 'age_group', direction: 'asc' }}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-pink-400" />
              Campaign Performance by Female Age Groups
            </h2>
            <Table
              columns={tableColumns}
              data={genderAgeGroupMetrics.female}
              maxHeight="350px"
              emptyMessage="No female demographic data available"
              defaultSort={{ key: 'age_group', direction: 'asc' }}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
