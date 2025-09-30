"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { employeesAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface EmployeeFormProps {
  employee?: any
  onSuccess: () => void
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: "",
    salary: "",
    status: "active",
    address: "",
    emergency_contact: "",
    notes: "",
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "",
        hire_date: employee.hire_date?.split("T")[0] || "",
        salary: employee.salary?.toString() || "",
        status: employee.status || "active",
        address: employee.address || "",
        emergency_contact: employee.emergency_contact || "",
        notes: employee.notes || "",
      })
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        salary: formData.salary ? Number.parseFloat(formData.salary) : null,
      }

      if (employee) {
        await employeesAPI.update(employee.id, data)
        toast({
          title: "Employee updated",
          description: "The employee has been successfully updated.",
        })
      } else {
        await employeesAPI.create(data)
        toast({
          title: "Employee added",
          description: "The employee has been successfully added.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save employee",
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
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            disabled={loading}
            placeholder="e.g., Farm Manager, Technician"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            disabled={loading}
            placeholder="e.g., Operations, Sales"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hire_date">Hire Date</Label>
          <Input
            id="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            disabled={loading}
            placeholder="Monthly salary"
          />
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergency_contact">Emergency Contact</Label>
        <Input
          id="emergency_contact"
          value={formData.emergency_contact}
          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          disabled={loading}
          placeholder="Name and phone number"
        />
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
          ) : employee ? (
            "Update Employee"
          ) : (
            "Add Employee"
          )}
        </Button>
      </div>
    </form>
  )
}
