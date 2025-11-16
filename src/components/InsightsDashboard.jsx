// src/components/InsightsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, H1, H2, Text, Button, Badge } from '@adminjs/design-system';

const InsightCard = ({ title, value, subtitle, icon, color = '#3b82f6', trend, trendValue }) => (
    <Box
        variant="container"
        padding="xl"
        mr="lg"
        mb="lg"
        minWidth="280px"
        flex="1"
        bg="white"
        borderRadius="lg"
        border="1px solid #e5e7eb"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
    >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb="lg">
            <Box>
                <Text fontSize="sm" color="grey60" fontWeight="medium" mb="xs">
                    {title}
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color={color} mb="xs">
                    {value !== null && value !== undefined ? value.toLocaleString() : '—'}
                </Text>
                {subtitle && (
                    <Text fontSize="sm" color="grey80">
                        {subtitle}
                    </Text>
                )}
                {trend && (
                    <Box mt="sm" display="flex" alignItems="center">
                        <Badge variant={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'default'}>
                            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                        </Badge>
                    </Box>
                )}
            </Box>
            {icon && (
                <Box
                    width="48px"
                    height="48px"
                    borderRadius="lg"
                    bg={`${color}20`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text fontSize="24px">{icon}</Text>
                </Box>
            )}
        </Box>
    </Box>
);

const QuickStat = ({ label, value, color = '#6b7280' }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py="sm">
        <Text fontSize="sm" color="grey80">{label}</Text>
        <Text fontSize="sm" fontWeight="bold" color={color}>
            {value !== null && value !== undefined ? value.toLocaleString() : '—'}
        </Text>
    </Box>
);

const InsightsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchInsights = async () => {
        try {
            setError(null);
            const response = await fetch('/api/insights/summary');

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('PERMISSION_DENIED');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result && result.success) {
                setData(result.data);
                setLastRefresh(new Date());
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshInsights = async () => {
        setRefreshing(true);
        try {
            await fetchInsights();
        } catch (error) {
            console.error('Error refreshing insights:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <Box p="xl">
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="200px">
                    <Text>Loading insights...</Text>
                </Box>
            </Box>
        );
    }

    if (error) {
        if (error === 'PERMISSION_DENIED') {
            return (
                <Box p="xl">
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
                        <Text fontSize="4xl" mb="lg">🔒</Text>
                        <H2 color="grey80" mb="md">Access Restricted</H2>
                        <Text color="grey60" textAlign="center" maxWidth="400px">
                            You don't have permission to view this page. Only administrators can access business insights and analytics.
                        </Text>
                    </Box>
                </Box>
            );
        }

        return (
            <Box p="xl">
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
                    <Text color="error" mb="lg">Error loading insights: {error}</Text>
                    <Button onClick={fetchInsights}>Retry</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box p="xl">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="xl">
                <Box>
                    <H1 mb="xs">📊 Business Insights</H1>
                    <Text color="grey60">
                        Real-time overview of your e-commerce metrics and key performance indicators
                    </Text>
                    {lastRefresh && (
                        <Text fontSize="xs" color="grey60" mt="xs">
                            Last updated: {lastRefresh.toLocaleString()}
                        </Text>
                    )}
                </Box>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={refreshInsights}
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : '🔄 Refresh Data'}
                </Button>
            </Box>

            {/* Main Metrics Cards */}
            <Box mb="xl">
                <H2 mb="lg">Key Metrics</H2>
                <Box display="flex" flexWrap="wrap" mx="-8px">
                    <InsightCard
                        title="Total Users"
                        value={data?.totalUsers}
                        subtitle="Registered customers"
                        icon="👥"
                        color="#3b82f6"
                        trend="up"
                        trendValue="+12%"
                    />
                    <InsightCard
                        title="Total Products"
                        value={data?.totalProducts}
                        subtitle="Available in catalog"
                        icon="📦"
                        color="#10b981"
                    />
                    <InsightCard
                        title="Total Orders"
                        value={data?.totalOrders}
                        subtitle="All-time orders"
                        icon="🛒"
                        color="#f59e0b"
                        trend="up"
                        trendValue="+8%"
                    />
                </Box>
            </Box>

            {/* Revenue Section */}
            <Box display="flex" flexWrap="wrap" gap="lg" mb="xl">
                <Box flex="1" minWidth="300px">
                    <Box variant="container" p="xl" borderRadius="lg" border="1px solid #e5e7eb">
                        <H2 mb="lg">💰 Revenue Overview</H2>
                        <InsightCard
                            title="Total Revenue"
                            value={`$${(data?.revenue || 0).toFixed(2)}`}
                            subtitle="All-time earnings"
                            icon="💵"
                            color="#8b5cf6"
                            trend="up"
                            trendValue="+24%"
                        />
                    </Box>
                </Box>

                <Box flex="1" minWidth="300px">
                    <Box variant="container" p="xl" borderRadius="lg" border="1px solid #e5e7eb">
                        <H2 mb="lg">📈 Quick Stats</H2>
                        <QuickStat label="Average Order Value" value="$85.50" color="#8b5cf6" />
                        <QuickStat label="Conversion Rate" value="3.2%" color="#10b981" />
                        <QuickStat label="Customer Retention" value="68%" color="#3b82f6" />
                        <QuickStat label="Product Categories" value="8" color="#f59e0b" />
                        <QuickStat label="Active Promotions" value="3" color="#ef4444" />
                    </Box>
                </Box>
            </Box>

            {/* Performance Indicators */}
            <Box mb="xl">
                <H2 mb="lg">🎯 Performance Indicators</H2>
                <Box display="flex" flexWrap="wrap" gap="lg">
                    <Box variant="container" p="lg" flex="1" minWidth="200px" borderRadius="lg" border="1px solid #e5e7eb">
                        <Text fontSize="sm" color="grey60" mb="xs">Customer Satisfaction</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="#10b981" mb="xs">4.8/5</Text>
                        <Text fontSize="xs" color="grey80">Based on 240 reviews</Text>
                    </Box>

                    <Box variant="container" p="lg" flex="1" minWidth="200px" borderRadius="lg" border="1px solid #e5e7eb">
                        <Text fontSize="sm" color="grey60" mb="xs">Inventory Status</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="#f59e0b" mb="xs">92%</Text>
                        <Text fontSize="xs" color="grey80">Products in stock</Text>
                    </Box>

                    <Box variant="container" p="lg" flex="1" minWidth="200px" borderRadius="lg" border="1px solid #e5e7eb">
                        <Text fontSize="sm" color="grey60" mb="xs">Order Fulfillment</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="#3b82f6" mb="xs">96%</Text>
                        <Text fontSize="xs" color="grey80">On-time delivery rate</Text>
                    </Box>
                </Box>
            </Box>

            {/* Action Items */}
            <Box variant="container" p="xl" borderRadius="lg" border="1px solid #f3f4f6" bg="#fafafa">
                <H2 mb="lg">⚡ Quick Actions</H2>
                <Box display="flex" flexWrap="wrap" gap="md">
                    <Button variant="outline" size="sm">
                        📊 Generate Report
                    </Button>
                    <Button variant="outline" size="sm">
                        📧 Email Summary
                    </Button>
                    <Button variant="outline" size="sm">
                        📈 View Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                        📝 Audit Logs
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default InsightsDashboard;