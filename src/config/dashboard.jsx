import React, { useEffect, useState } from 'react'
import { Box, H1, Text, ValueGroup, ValueGroupLabel, Illustration } from '@adminjs/design-system'
import { ApiClient, useCurrentAdmin } from 'adminjs'

const api = new ApiClient()

const Stat = ({ label, value }) => (
    <Box variant="container" padding="lg" mr="lg" mb="lg">
        <ValueGroup>
            <ValueGroupLabel>{label}</ValueGroupLabel>
            <Text variant="lg" fontWeight="bold">{value !== null && value !== undefined ? value : '—'}</Text>
        </ValueGroup>
    </Box>
)

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
                // ignore
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

    const { message, stats } = data

    return (
        <Box>
            <H1>Dashboard</H1>
            <Text mb="xl">{message}</Text>
            <Box display="flex" flexWrap="wrap">
                {currentAdmin?.role === 'admin' && (
                    <Stat label="Total Users" value={stats?.totalUsers} />
                )}
                <Stat label="Total Products" value={stats?.totalProducts} />
                <Stat label="Total Orders" value={stats?.totalOrders} />
                <Stat label="Total Categories" value={stats?.totalCategories} />
            </Box>
        </Box>
    )
}

export default Dashboard

