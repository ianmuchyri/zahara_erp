"use client"

import type React from "react"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { paymentsAPI, customersAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface PaymentFormProps {
  payment?: any
  onSuccess: () => void
}

export function PaymentForm({ payment, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    customer_id: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    reference_number: "",
    notes: "",
  })

  const { data: customers } = useSWR("/customers", () => customersAPI.getAll().then((res) => res.data))
  const { data: paymentTypes } = useSWR("/payment-types", () => paymentsAPI.getTypes().then((res) => res.data))

  useEffect(() => {
    if (payment) {
      setFormData({
        customer_id: payment.customer_id?.toString() || "",
        amount: payment.amount?.toString() || "",
        payment_date: payment.payment_date?.split("T")[0] || "",
        payment_method: payment.payment_method || "cash",
        reference_number: payment.reference_number || "",
        notes: payment.notes || "",
      })
    }
  }, [payment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        customer_id: Number.parseInt(formData.customer_id),
        amount: Number.parseFloat(formData.amount),
      }

      if (payment) {
        await paymentsAPI.update(payment.id, data)
        toast({
          title: "Payment updated",
          description: "The payment has been successfully updated.",
        })
      } else {
        await paymentsAPI.create(data)
        toast({
          title: "Payment recorded",
          description: "The payment has been successfully recorded.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save payment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              {customers?.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            disabled={loading}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentTypes?.map((type: any) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              )) || (
                <>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="reference_number">Reference Number</Label>
          <Input
            id="reference_number"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            disabled={loading}
            placeholder="Transaction reference or check number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : payment ? (
            "Update Payment"
          ) : (
            "Record Payment"
          )}
        </Button>
      </div>
    </form>
  )
}
