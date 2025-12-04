"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Data Types ---
type DeviceType = 'Mobile' | 'Desktop' | 'Tablet';

interface DevicePerformance {
    device: DeviceType;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    ctr: number;
    'conversion_rate': number;
    'percentage_of_traffic': number;
}

// Recharts data format
interface ChartDataPoint {
    name: string;
    Mobile: number;
    Desktop: number;
    Tablet: number;
}

// --- Helper functions for formatting ---
const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const formatPercentage = (value: number) => `${value.toFixed(2)}%`;


export default function DeviceView() {
    const [data, setData] = useState<DevicePerformance[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/marketing-data');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                
                // --- ROBUST DATA EXTRACTION LOGIC ---
                let extractedData: DevicePerformance[] = [];

                // Extract campaigns from the API response
                const campaigns = json?.campaigns || (Array.isArray(json) ? json : []);

                if (Array.isArray(campaigns) && campaigns.length > 0) {
                    // Aggregate metrics by device (primary_device from each campaign)
                    const deviceMap = new Map<DeviceType, DevicePerformance>();

                    campaigns.forEach((campaign: any) => {
                        // Determine the device type: use primary_device or default to 'Mobile'
                        const deviceType = (campaign?.target_demographics?.primary_device || 'Mobile') as DeviceType;
                        
                        // Get or initialize the device record
                        if (!deviceMap.has(deviceType)) {
                            deviceMap.set(deviceType, {
                                device: deviceType,
                                impressions: 0,
                                clicks: 0,
                                conversions: 0,
                                spend: 0,
                                revenue: 0,
                                ctr: 0,
                                conversion_rate: 0,
                                percentage_of_traffic: 0,
                            });
                        }

                        // Accumulate campaign metrics
                        const device = deviceMap.get(deviceType)!;
                        device.impressions += campaign.impressions ?? 0;
                        device.clicks += campaign.clicks ?? 0;
                        device.conversions += campaign.conversions ?? 0;
                        device.spend += campaign.spend ?? 0;
                        device.revenue += campaign.revenue ?? 0;
                    });

                    // Convert map to array and calculate derived metrics
                    const totalImpressions = Array.from(deviceMap.values()).reduce((sum, d) => sum + d.impressions, 0);
                    extractedData = Array.from(deviceMap.values()).map((device) => ({
                        ...device,
                        ctr: device.impressions > 0 ? (device.clicks / device.impressions) * 100 : 0,
                        conversion_rate: device.clicks > 0 ? (device.conversions / device.clicks) * 100 : 0,
                        percentage_of_traffic: totalImpressions > 0 ? (device.impressions / totalImpressions) * 100 : 0,
                    }));

                    console.log('Extracted device data:', extractedData);
                }
            
                // --- END OF EXTRACTION LOGIC ---

                setData(extractedData);
            } catch (err) {
                console.error('Failed to load device data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const deviceData = data || [];

    // Prepare the data for the bar chart
    const chartData: ChartDataPoint[] = useMemo(() => {
        const metrics = ['Revenue', 'Spend', 'Conversions', 'Clicks'];
        const deviceMap = new Map<DeviceType, DevicePerformance>();
        deviceData.forEach(d => deviceMap.set(d.device, d));

        return metrics.map(metric => ({
            name: metric,
            Mobile: (deviceMap.get('Mobile')?.[metric.toLowerCase() as keyof DevicePerformance] as number) ?? 0,
            Desktop: (deviceMap.get('Desktop')?.[metric.toLowerCase() as keyof DevicePerformance] as number) ?? 0,
            Tablet: (deviceMap.get('Tablet')?.[metric.toLowerCase() as keyof DevicePerformance] as number) ?? 0,
        }));
    }, [deviceData]);


    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-white text-xl">Loading device performance data…</div>;
    }

    if (error) {
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-red-400 text-xl">Error: {error}</div>;
    }


    return (
        <div className="flex h-screen bg-gray-900">
            <Navbar />

            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
                
                <section className="bg-gradient-to-r from-blue-800 to-blue-700 text-white py-12">
                    <div className="px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-3">
                                <Smartphone className="h-8 w-8" /> 
                                <Monitor className="h-8 w-8" />
                                <Tablet className="h-8 w-8" />
                                Device Performance Breakdown
                            </h1>
                            <p className="text-blue-200 mt-2">Comparison of key marketing campaign metrics by Mobile, Desktop, and Tablet.</p>
                        </div>
                    </div>
                </section>

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {deviceData.length === 0 ? (
                        <p className="text-gray-400 text-center text-xl">No device breakdown data available. Please check your API response structure.</p>
                    ) : (
                        <div className="space-y-8">
                            
                            {/* --- 1. Bar Chart Visualization --- */}
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl h-[450px]">
                                <h3 className="text-xl font-semibold text-white mb-4">Financial & Volume Comparison</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                        <XAxis dataKey="name" stroke="#cbd5e0" />
                                        <YAxis 
                                            stroke="#cbd5e0" 
                                            // Use currency formatter only for Revenue/Spend
                                            tickFormatter={(value, index) => chartData[index]?.name === 'Revenue' || chartData[index]?.name === 'Spend' ? formatCurrency(value) : value.toLocaleString()}
                                        />
                                        <Tooltip 
                                            formatter={(value: number, name: string, props) => {
                                                if (props.payload && (props.payload.name === 'Revenue' || props.payload.name === 'Spend')) {
                                                    return [formatCurrency(value), name];
                                                }
                                                return [value.toLocaleString(), name];
                                            }}
                                            labelFormatter={(label) => `Metric: ${label}`}
                                            contentStyle={{ backgroundColor: '#2d3748', border: 'none', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Mobile" fill="#3b82f6" name="Mobile" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Desktop" fill="#f59e0b" name="Desktop" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Tablet" fill="#10b981" name="Tablet" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* --- 2. Data Table / Detailed Breakdown --- */}
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                                <h3 className="text-xl font-semibold text-white mb-4">Detailed Performance Metrics</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700 text-white">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Metric</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Mobile</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Desktop</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Tablet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {['revenue', 'spend', 'impressions', 'clicks', 'conversions', 'conversion_rate', 'ctr', 'percentage_of_traffic'].map((metricKey) => {
                                                
                                                const mobileValue = (deviceData.find(d => d.device === 'Mobile')?.[metricKey as keyof DevicePerformance] ?? 0) as number;
                                                const desktopValue = (deviceData.find(d => d.device === 'Desktop')?.[metricKey as keyof DevicePerformance] ?? 0) as number;
                                                const tabletValue = (deviceData.find(d => d.device === 'Tablet')?.[metricKey as keyof DevicePerformance] ?? 0) as number;
                                                
                                                // Determine the display format
                                                let displayFormat: (value: number) => string;

                                                if (['revenue', 'spend'].includes(metricKey)) {
                                                    displayFormat = formatCurrency;
                                                } else if (['conversion_rate', 'percentage_of_traffic', 'ctr'].includes(metricKey)) {
                                                    displayFormat = formatPercentage;
                                                } else {
                                                    displayFormat = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });
                                                }
                                                
                                                // Clean up metric display name
                                                const metricName = metricKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                                return (
                                                    <tr key={metricKey} className="hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{metricName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-300">{displayFormat(mobileValue)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-yellow-300">{displayFormat(desktopValue)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-300">{displayFormat(tabletValue)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}