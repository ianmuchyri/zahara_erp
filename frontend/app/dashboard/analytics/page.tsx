"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"
import { analyticsAPI } from "@/lib/api"

const COLORS = ["oklch(0.35 0.08 145)", "oklch(0.65 0.12 35)", "oklch(0.55 0.1 85)", "oklch(0.45 0.06 180)"]

export default function AnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useSWR("/analytics/dashboard", () =>
    analyticsAPI.getDashboard().then((res) => res.data),
  )

  const { data: salesData, isLoading: salesLoading } = useSWR("/analytics/sales", () =>
    analyticsAPI.getSales().then((res) => res.data),
  )

  const { data: paymentsData, isLoading: paymentsLoading } = useSWR("/analytics/payments", () =>
    analyticsAPI.getPayments().then((res) => res.data),
  )

  if (dashboardLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.total_revenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-green-600" />
              {dashboard?.revenue_growth || "0"}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-green-600" />
              {dashboard?.orders_growth || "0"}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.active_customers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-green-600" />
              {dashboard?.customers_growth || "0"}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.avg_order_value?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payment Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
                <CardDescription>Sales performance over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="oklch(0.35 0.08 145)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Product category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salesData?.by_category || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salesData?.by_category?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentsData?.by_method || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="oklch(0.65 0.12 35)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
