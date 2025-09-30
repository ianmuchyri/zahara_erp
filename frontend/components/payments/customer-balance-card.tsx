"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, Loader2 } from "lucide-react"
import { customersAPI } from "@/lib/api"

interface CustomerBalanceCardProps {
  onViewStatement: (customer: any) => void
}

export function CustomerBalanceCard({ onViewStatement }: CustomerBalanceCardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: customers,
    isLoading,
    error,
  } = useSWR("/customers-with-balance", () => customersAPI.getAll({ include_balance: true }).then((res) => res.data))

  const filteredCustomers = customers?.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Balances</CardTitle>
        <CardDescription>View outstanding balances and account statements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground">Failed to load customer balances</div>
        ) : filteredCustomers?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No customers found</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Total Payments</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers?.map((customer: any) => {
                  const balance = (customer.total_sales || 0) - (customer.total_payments || 0)
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>${customer.total_sales?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>${customer.total_payments?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>
                        <span className={balance > 0 ? "font-semibold text-red-600" : "text-muted-foreground"}>
                          ${Math.abs(balance).toFixed(2)} {balance > 0 ? "owed" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onViewStatement(customer)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
