import React, { useEffect, useState } from 'react'
import { Box, H1, H2, H3, Text, ValueGroup, ValueGroupLabel, Illustration, Badge, Table, TableHead, TableBody, TableRow, TableCell } from '@adminjs/design-system'
import { ApiClient, useCurrentAdmin } from 'adminjs'

const api = new ApiClient()

const Stat = ({ label, value, unit = '' }) => (
    <Box variant="container" padding="lg" mr="lg" mb="lg" minWidth="200px">
        <ValueGroup>
            <ValueGroupLabel>{label}</ValueGroupLabel>
            <Text variant="lg" fontWeight="bold">
                {value !== null && value !== undefined ? `${value}${unit}` : '—'}
            </Text>
        </ValueGroup>
    </Box>
)

const formatUptime = (seconds) => {
    if (!seconds) return '—'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(' ')
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
}

const AdminDashboard = ({ data }) => {
    const { message, stats, systemMetrics } = data

    return (
        <Box p="lg">
            <Box mb="xl">
                <H1>Admin Dashboard</H1>
                <Text fontSize="lg" color="grey60" mt="default">{message}</Text>
            </Box>

            {/* Business Statistics */}
            <Box mb="xl">
                <H2 mb="lg">System Summary</H2>
                <Box display="flex" flexWrap="wrap">
                    <Stat label="Total Users" value={stats?.totalUsers} />
                    <Stat label="Total Products" value={stats?.totalProducts} />
                    <Stat label="Total Orders" value={stats?.totalOrders} />
                    <Stat label="Total Categories" value={stats?.totalCategories} />
                    <Stat label="Total Revenue" value={stats?.totalRevenue ? `$${stats.totalRevenue}` : '—'} />
                </Box>
            </Box>

            {/* System Metrics - Admin Only */}
            {systemMetrics && (
                <Box mb="xl">
                    <H2 mb="lg">System Metrics</H2>

                    {/* Server Information */}
                    <Box mb="lg">
                        <Text fontSize="md" fontWeight="bold" mb="default">Server Status</Text>
                        <Box display="flex" flexWrap="wrap">
                            <Stat label="Server Uptime" value={formatUptime(systemMetrics.serverUptime)} />
                            <Stat
                                label="Memory Usage"
                                value={`${systemMetrics.memoryUsage?.used} / ${systemMetrics.memoryUsage?.total} MB (${systemMetrics.memoryUsage?.percentage}%)`}
                            />
                            <Stat label="Node Version" value={systemMetrics.nodeVersion} />
                            <Stat label="Platform" value={systemMetrics.platform} />
                        </Box>
                    </Box>

                    {/* Database Information */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb="default">Database Status</Text>
                        <Box display="flex" flexWrap="wrap" alignItems="center">
                            <Box variant="container" padding="lg" mr="lg" mb="lg" minWidth="200px">
                                <ValueGroup>
                                    <ValueGroupLabel>Connection Status</ValueGroupLabel>
                                    <Box mt="sm">
                                        <Badge variant={systemMetrics.database?.connected ? 'success' : 'danger'}>
                                            {systemMetrics.database?.connected ? 'Connected' : 'Disconnected'}
                                        </Badge>
                                    </Box>
                                </ValueGroup>
                            </Box>
                            {systemMetrics.database?.uptime && (
                                <Stat label="Database Uptime" value={formatUptime(systemMetrics.database.uptime)} />
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

const RegularUserDashboard = ({ data }) => {
    const { message, stats, recentOrders } = data

    return (
        <Box p="lg">
            <Box mb="xl">
                <H1>Dashboard</H1>
                <Text fontSize="lg" color="grey60" mt="default">{message}</Text>
            </Box>

            {/* Limited Business Overview */}
            <Box mb="xl">
                <H2 mb="lg">Overview</H2>
                <Box display="flex" flexWrap="wrap">
                    <Stat label="Total Products" value={stats?.totalProducts} />
                    <Stat label="Total Orders" value={stats?.totalOrders} />
                    <Stat label="Total Categories" value={stats?.totalCategories} />
                    <Stat label="Today's Orders" value={stats?.todaysOrders} />
                    <Stat label="This Week's Orders" value={stats?.thisWeekOrders} />
                </Box>
            </Box>

            {/* Recent Activity */}
            {recentOrders && recentOrders.length > 0 && (
                <Box mb="xl">
                    <H2 mb="lg">Recent Orders</H2>
                    <Box variant="container" padding="lg">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentOrders.slice(0, 5).map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>#{order.id}</TableCell>
                                        <TableCell>
                                            {order.customerName || order.customerEmail || 'N/A'}
                                        </TableCell>
                                        <TableCell>${order.totalAmount || '0.00'}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'completed' ? 'success' : 'default'}>
                                                {order.status || 'pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            )}

            {/* Personal Performance */}
            <Box mb="xl">
                <H2 mb="lg">Quick Actions</H2>
                <Text color="grey60">
                    You can manage products, categories, orders, and order items using the navigation menu.
                </Text>
            </Box>
        </Box>
    )
}

const Dashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { currentAdmin } = useCurrentAdmin()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.getDashboard()
                setData(res?.data || null)
            } catch (e) {
                console.error('Dashboard load error:', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <Box variant="container" p="lg">
                <Text>Loading dashboard…</Text>
            </Box>
        )
    }

    if (!data) {
        return (
            <Box variant="container" p="xl" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Illustration variant="NoData" width={200} height={200} />
                <Text mt="lg">No dashboard data available.</Text>
            </Box>
        )
    }

    // Render different dashboard based on user role and dashboard type
    if (data.dashboardType === 'admin') {
        return <AdminDashboard data={data} />
    } else {
        return <RegularUserDashboard data={data} />
    }
}

export default Dashboard

