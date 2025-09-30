import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, CreditCard, TrendingUp, Sprout } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Customers",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      color: "text-chart-1",
    },
    {
      title: "Active Orders",
      value: "89",
      change: "+5.2%",
      icon: ShoppingCart,
      color: "text-chart-2",
    },
    {
      title: "Products",
      value: "456",
      change: "+8.1%",
      icon: Package,
      color: "text-chart-3",
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+15.3%",
      icon: CreditCard,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your agricultural business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-chart-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary p-3">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">Welcome to Zahara ERP</CardTitle>
              <CardDescription>Your complete agricultural management solution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Manage your customers, products, orders, payments, and more all in one place. Track your farm operations,
            analyze sales data, and grow your agricultural business with our comprehensive ERP system designed
            specifically for farming enterprises.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>View and manage recent orders</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Pending Payments</CardTitle>
            <CardDescription>Track outstanding payments</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Crop Management</CardTitle>
            <CardDescription>Monitor your farm blocks</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
