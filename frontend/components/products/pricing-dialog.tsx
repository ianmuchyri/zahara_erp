"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { api, customersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PricingDialogProps {
  product: any
  open: boolean
  onClose: () => void
}

export function PricingDialog({ product, open, onClose }: PricingDialogProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingPrice, setEditingPrice] = useState<any>(null)
  const { toast } = useToast()

  const {
    data: pricing,
    isLoading,
    mutate,
  } = useSWR(product ? `/products/${product.id}/pricing` : null, () =>
    api.get(`/products/${product.id}/pricing`).then((res) => res.data),
  )

  const { data: customers } = useSWR("/customers", () => customersAPI.getAll().then((res) => res.data))

  const handleDelete = async (priceId: number) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return

    try {
      await api.delete(`/products/${product.id}/pricing/${priceId}`)
      mutate()
      toast({
        title: "Pricing deleted",
        description: "The pricing rule has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete pricing",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Customer Pricing - {product?.name}</DialogTitle>
          <DialogDescription>Manage customer-specific pricing for this product</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing Rule
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pricing?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No custom pricing rules found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Min Quantity</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing?.map((price: any) => (
                    <TableRow key={price.id}>
                      <TableCell className="font-medium">{price.customer_name}</TableCell>
                      <TableCell>${price.price?.toFixed(2)}</TableCell>
                      <TableCell>{price.min_quantity || "-"}</TableCell>
                      <TableCell>{price.valid_from || "-"}</TableCell>
                      <TableCell>{price.valid_to || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingPrice(price)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(price.id)}>
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

          {(isCreating || editingPrice) && (
            <PricingForm
              productId={product.id}
              pricing={editingPrice}
              customers={customers || []}
              onSuccess={() => {
                mutate()
                setIsCreating(false)
                setEditingPrice(null)
              }}
              onCancel={() => {
                setIsCreating(false)
                setEditingPrice(null)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PricingForm({ productId, pricing, customers, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    customer_id: pricing?.customer_id?.toString() || "",
    price: pricing?.price?.toString() || "",
    min_quantity: pricing?.min_quantity?.toString() || "",
    valid_from: pricing?.valid_from || "",
    valid_to: pricing?.valid_to || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        customer_id: Number.parseInt(formData.customer_id),
        price: Number.parseFloat(formData.price),
        min_quantity: formData.min_quantity ? Number.parseInt(formData.min_quantity) : null,
        valid_from: formData.valid_from || null,
        valid_to: formData.valid_to || null,
      }

      if (pricing) {
        await api.put(`/products/${productId}/pricing/${pricing.id}`, data)
        toast({
          title: "Pricing updated",
          description: "The pricing rule has been successfully updated.",
        })
      } else {
        await api.post(`/products/${productId}/pricing`, data)
        toast({
          title: "Pricing created",
          description: "The pricing rule has been successfully created.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save pricing",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-muted/50 p-4">
      <h3 className="font-semibold">{pricing ? "Edit Pricing Rule" : "New Pricing Rule"}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Select
            value={formData.customer_id}
            onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_quantity">Minimum Quantity</Label>
          <Input
            id="min_quantity"
            type="number"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_from">Valid From</Label>
          <Input
            id="valid_from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_to">Valid To</Label>
          <Input
            id="valid_to"
            type="date"
            value={formData.valid_to}
            onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : pricing ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  )
}
