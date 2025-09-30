"use client"

import { useState } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download } from "lucide-react"
import { paymentsAPI } from "@/lib/api"

interface AccountStatementDialogProps {
  customer: any
  open: boolean
  onClose: () => void
}

export function AccountStatementDialog({ customer, open, onClose }: AccountStatementDialogProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data: statement, isLoading } = useSWR(
    customer ? `/customers/${customer.id}/statement?from=${dateFrom}&to=${dateTo}` : null,
    () => paymentsAPI.getStatement(customer.id, { from: dateFrom, to: dateTo }).then((res) => res.data),
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Account Statement - {customer?.name}</DialogTitle>
          <DialogDescription>View transaction history and account balance</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date_from">From Date</Label>
              <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="date_to">To Date</Label>
              <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : statement?.transactions?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No transactions found</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement?.transactions?.map((transaction: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {transaction.debit ? `$${transaction.debit.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {transaction.credit ? `$${transaction.credit.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">${transaction.balance?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-8 rounded-lg bg-muted p-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Debits</div>
                  <div className="text-lg font-semibold text-red-600">${statement?.total_debits?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                  <div className="text-lg font-semibold text-green-600">${statement?.total_credits?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                  <div className="text-lg font-semibold">${statement?.current_balance?.toFixed(2)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
