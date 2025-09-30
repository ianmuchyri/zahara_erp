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
import { expensesAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface ExpenseFormProps {
  expense?: any
  onSuccess: () => void
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: "",
    vendor: "",
    payment_method: "cash",
    status: "pending",
    notes: "",
  })

  const { data: categories } = useSWR("/expense-categories", () => expensesAPI.getCategories().then((res) => res.data))

  useEffect(() => {
    if (expense) {
      setFormData({
        expense_date: expense.expense_date?.split("T")[0] || "",
        category: expense.category || "",
        description: expense.description || "",
        amount: expense.amount?.toString() || "",
        vendor: expense.vendor || "",
        payment_method: expense.payment_method || "cash",
        status: expense.status || "pending",
        notes: expense.notes || "",
      })
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
      }

      if (expense) {
        await expensesAPI.update(expense.id, data)
        toast({
          title: "Expense updated",
          description: "The expense has been successfully updated.",
        })
      } else {
        await expensesAPI.create(data)
        toast({
          title: "Expense recorded",
          description: "The expense has been successfully recorded.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save expense",
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
          <Label htmlFor="expense_date">Date *</Label>
          <Input
            id="expense_date"
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              )) || (
                <>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={loading}
            placeholder="Brief description of the expense"
          />
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
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            disabled={loading}
            placeholder="Vendor or supplier name"
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
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
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
          ) : expense ? (
            "Update Expense"
          ) : (
            "Record Expense"
          )}
        </Button>
      </div>
    </form>
  )
}
