"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { paymentsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PaymentForm } from "@/components/payments/payment-form"
import { CustomerBalanceCard } from "@/components/payments/customer-balance-card"
import { AccountStatementDialog } from "@/components/payments/account-statement-dialog"

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [viewingStatement, setViewingStatement] = useState<any>(null)
  const { toast } = useToast()

  const {
    data: payments,
    error,
    isLoading,
    mutate,
  } = useSWR("/payments", () => paymentsAPI.getAll({ search: searchQuery }).then((res) => res.data))

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return

    try {
      await paymentsAPI.delete(id)
      mutate()
      toast({
        title: "Payment deleted",
        description: "The payment has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete payment",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = () => {
    mutate()
    setIsCreateOpen(false)
    setEditingPayment(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Process and track customer payments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Record New Payment</DialogTitle>
              <DialogDescription>Record a payment from a customer</DialogDescription>
            </DialogHeader>
            <PaymentForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="balances">Customer Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
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
                <div className="py-8 text-center text-muted-foreground">Failed to load payments</div>
              ) : payments?.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No payments found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments?.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{payment.customer_name}</TableCell>
                          <TableCell className="font-semibold text-green-600">${payment.amount?.toFixed(2)}</TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell className="font-mono text-sm">{payment.reference_number}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setEditingPayment(payment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
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

        <TabsContent value="balances" className="space-y-4">
          <CustomerBalanceCard onViewStatement={setViewingStatement} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Payment</DialogTitle>
            <DialogDescription>Update payment information</DialogDescription>
          </DialogHeader>
          <PaymentForm payment={editingPayment} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      {viewingStatement && (
        <AccountStatementDialog
          customer={viewingStatement}
          open={!!viewingStatement}
          onClose={() => setViewingStatement(null)}
        />
      )}
    </div>
  )
}
