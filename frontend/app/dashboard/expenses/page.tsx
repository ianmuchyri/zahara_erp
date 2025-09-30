"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Paperclip, Loader2 } from "lucide-react"
import { expensesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ExpenseForm } from "@/components/expenses/expense-form"

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const { toast } = useToast()

  const {
    data: expenses,
    error,
    isLoading,
    mutate,
  } = useSWR("/expenses", () => expensesAPI.getAll({ search: searchQuery }).then((res) => res.data))

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await expensesAPI.delete(id)
      mutate()
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = () => {
    mutate()
    setIsCreateOpen(false)
    setEditingExpense(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Record New Expense</DialogTitle>
              <DialogDescription>Add a new business expense</DialogDescription>
            </DialogHeader>
            <ExpenseForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>View and manage all business expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
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
            <div className="py-8 text-center text-muted-foreground">Failed to load expenses</div>
          ) : expenses?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No expenses found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="font-semibold">${expense.amount?.toFixed(2)}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell>
                        <Badge
                          variant={expense.status === "approved" ? "default" : "secondary"}
                          className={
                            expense.status === "approved"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : expense.status === "rejected"
                                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                : ""
                          }
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {expense.has_attachments && (
                            <Button variant="ghost" size="icon">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setEditingExpense(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Expense</DialogTitle>
            <DialogDescription>Update expense information</DialogDescription>
          </DialogHeader>
          <ExpenseForm expense={editingExpense} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
