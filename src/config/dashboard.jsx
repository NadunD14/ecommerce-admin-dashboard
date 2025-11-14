// src/config/dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, H3, Text, Card } from '@adminjs/design-system';
import { ApiClient, useCurrentAdmin } from 'adminjs';

const api = new ApiClient();

const Dashboard = () => {
    const [currentAdmin] = useCurrentAdmin();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDashboard()
            .then((response) => {
                setStats(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error loading dashboard:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Box padding="xxl"><Text>Loading...</Text></Box>;
    }

    const isAdmin = currentAdmin?.role === 'admin';

    return (
        <Box padding="xxl">
            <H3 marginBottom="xl">
                {isAdmin ? '🎯 Admin Dashboard' : '👤 User Dashboard'}
            </H3>
            
            <Text marginBottom="xxl">
                {stats?.message || `Welcome ${currentAdmin?.email}!`}
            </Text>

            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gridGap="lg">
                {isAdmin && stats?.stats?.totalUsers !== null && (
                    <Card padding="lg">
                        <Text fontSize="sm" color="grey60">Total Users</Text>
                        <H3 marginTop="sm">{stats.stats.totalUsers}</H3>
                    </Card>
                )}
                
                {stats?.stats?.totalProducts !== null && (
                    <Card padding="lg">
                        <Text fontSize="sm" color="grey60">Total Products</Text>
                        <H3 marginTop="sm">{stats.stats.totalProducts}</H3>
                    </Card>
                )}
                
                {stats?.stats?.totalOrders !== null && (
                    <Card padding="lg">
                        <Text fontSize="sm" color="grey60">Total Orders</Text>
                        <H3 marginTop="sm">{stats.stats.totalOrders}</H3>
                    </Card>
                )}
                
                {stats?.stats?.totalCategories !== null && (
                    <Card padding="lg">
                        <Text fontSize="sm" color="grey60">Total Categories</Text>
                        <H3 marginTop="sm">{stats.stats.totalCategories}</H3>
                    </Card>
                )}
            </Box>

            <Box marginTop="xxl">
                <Card padding="lg">
                    <Text fontSize="sm" color="grey60">Your Role</Text>
                    <Text marginTop="sm" fontSize="lg" fontWeight="bold">
                        {isAdmin ? '🔑 Administrator' : '👤 Regular User'}
                    </Text>
                </Card>
            </Box>
        </Box>
    );
};

export default Dashboard;
