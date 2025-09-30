"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, Edit, Trash2, Loader2, FileText } from "lucide-react"
import { invoicesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const {
    data: invoices,
    error,
    isLoading,
    mutate,
  } = useSWR("/invoices", () => invoicesAPI.getAll({ search: searchQuery }).then((res) => res.data))

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      await invoicesAPI.delete(id)
      mutate()
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Invoices & Credit Notes</h1>
          <p className="text-muted-foreground">Manage invoices and credit notes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
              <CardDescription>View and manage all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
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
                <div className="py-8 text-center text-muted-foreground">Failed to load invoices</div>
              ) : invoices?.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No invoices found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices?.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                          <TableCell className="font-medium">{invoice.customer_name}</TableCell>
                          <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.total_amount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={invoice.status === "paid" ? "default" : "secondary"}
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : invoice.status === "overdue"
                                    ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                    : ""
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit-notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Notes</CardTitle>
              <CardDescription>Manage credit notes and refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">Credit Notes - Under Construction</h3>
                <p className="text-sm text-muted-foreground">
                  Credit note management functionality will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
