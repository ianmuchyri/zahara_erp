"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { branchesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BranchesDialogProps {
  customer: any
  open: boolean
  onClose: () => void
}

export function BranchesDialog({ customer, open, onClose }: BranchesDialogProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const { toast } = useToast()

  const {
    data: branches,
    isLoading,
    mutate,
  } = useSWR(customer ? `/customers/${customer.id}/branches` : null, () =>
    branchesAPI.getAll(customer.id).then((res) => res.data),
  )

  const handleDelete = async (branchId: number) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      await branchesAPI.delete(customer.id, branchId)
      mutate()
      toast({
        title: "Branch deleted",
        description: "The branch has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete branch",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Branches - {customer?.name}</DialogTitle>
          <DialogDescription>Manage customer branch locations</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : branches?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No branches found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches?.map((branch: any) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.contact_person}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingBranch(branch)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)}>
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

          {(isCreating || editingBranch) && (
            <BranchForm
              customerId={customer.id}
              branch={editingBranch}
              onSuccess={() => {
                mutate()
                setIsCreating(false)
                setEditingBranch(null)
              }}
              onCancel={() => {
                setIsCreating(false)
                setEditingBranch(null)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BranchForm({ customerId, branch, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    address: branch?.address || "",
    contact_person: branch?.contact_person || "",
    phone: branch?.phone || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (branch) {
        await branchesAPI.update(customerId, branch.id, formData)
        toast({
          title: "Branch updated",
          description: "The branch has been successfully updated.",
        })
      } else {
        await branchesAPI.create(customerId, formData)
        toast({
          title: "Branch created",
          description: "The branch has been successfully created.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save branch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-muted/50 p-4">
      <h3 className="font-semibold">{branch ? "Edit Branch" : "New Branch"}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="branch-name">Branch Name *</Label>
          <Input
            id="branch-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-person">Contact Person</Label>
          <Input
            id="contact-person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-address">Address</Label>
          <Input
            id="branch-address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-phone">Phone</Label>
          <Input
            id="branch-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
          ) : branch ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  )
}
