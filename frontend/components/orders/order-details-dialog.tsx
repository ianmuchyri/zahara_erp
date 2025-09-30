"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

interface OrderDetailsDialogProps {
  order: any
  open: boolean
  onClose: () => void
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  processing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function OrderDetailsDialog({ order, open, onClose }: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Order Details</DialogTitle>
          <DialogDescription>Order #{order?.order_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="font-medium">{order?.customer_name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={statusColors[order?.status] || ""} variant="secondary">
                {order?.status}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Order Date</div>
              <div className="font-medium">{new Date(order?.order_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Delivery Date</div>
              <div className="font-medium">
                {order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "Not set"}
              </div>
            </div>
          </div>

          {order?.notes && (
            <div>
              <div className="text-sm text-muted-foreground">Notes</div>
              <div className="mt-1 text-sm">{order.notes}</div>
            </div>
          )}

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="mb-3 font-semibold">Order Items</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order?.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">${order?.total_amount?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
