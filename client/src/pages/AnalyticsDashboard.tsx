import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Globe, Palette } from 'lucide-react';

interface AnalyticsData {
  businessTypes: Array<{ name: string; count: number }>;
  variantSelections: Array<{ name: string; count: number }>;
  customDomainRequests: number;
  totalUsers: number;
  conversionRate: number;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    businessTypes: [],
    variantSelections: [],
    customDomainRequests: 0,
    totalUsers: 0,
    conversionRate: 0
  });

  useEffect(() => {
    // In a real implementation, this would fetch from your analytics API
    // For now, we'll show sample data structure based on the tracking we implemented
    const mockData: AnalyticsData = {
      businessTypes: [
        { name: 'Restaurants', count: 45 },
        { name: 'Contractors', count: 32 },
        { name: 'Retail Stores', count: 28 },
        { name: 'Healthcare', count: 21 },
        { name: 'Services', count: 19 }
      ],
      variantSelections: [
        { name: 'Bold & Dramatic', count: 67 },
        { name: 'Premium Luxury', count: 45 },
        { name: 'Vibrant Energy', count: 33 }
      ],
      customDomainRequests: 58,
      totalUsers: 145,
      conversionRate: 78.5
    };
    
    setAnalyticsData(mockData);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your website generator performance and user insights</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Custom Domains</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.customDomainRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Palette className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Websites Created</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.variantSelections.reduce((sum, v) => sum + v.count, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Business Types</CardTitle>
              <p className="text-sm text-gray-600">Which industries use your platform most</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.businessTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Design Preferences Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Design Variant Preferences</CardTitle>
              <p className="text-sm text-gray-600">Which designs users choose most</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.variantSelections}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.variantSelections.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
            <p className="text-sm text-gray-600">Key opportunities for monetization</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Custom Domain Demand</h3>
                <p className="text-3xl font-bold text-blue-600">{Math.round((analyticsData.customDomainRequests / analyticsData.totalUsers) * 100)}%</p>
                <p className="text-sm text-blue-600">of users want custom domains</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Top Converting Business</h3>
                <p className="text-xl font-bold text-green-600">{analyticsData.businessTypes[0]?.name || 'N/A'}</p>
                <p className="text-sm text-green-600">Focus marketing here</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800">Most Popular Design</h3>
                <p className="text-xl font-bold text-purple-600">{analyticsData.variantSelections[0]?.name || 'N/A'}</p>
                <p className="text-sm text-purple-600">Create more like this</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}