"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { agricultureAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface BlockFormProps {
  block?: any
  onSuccess: () => void
}

export function BlockForm({ block, onSuccess }: BlockFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size_acres: "",
    soil_type: "",
    irrigation_type: "",
    current_crop: "",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    if (block) {
      setFormData({
        name: block.name || "",
        location: block.location || "",
        size_acres: block.size_acres?.toString() || "",
        soil_type: block.soil_type || "",
        irrigation_type: block.irrigation_type || "",
        current_crop: block.current_crop || "",
        status: block.status || "active",
        notes: block.notes || "",
      })
    }
  }, [block])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        size_acres: formData.size_acres ? Number.parseFloat(formData.size_acres) : null,
      }

      if (block) {
        await agricultureAPI.updateBlock(block.id, data)
        toast({
          title: "Farm block updated",
          description: "The farm block has been successfully updated.",
        })
      } else {
        await agricultureAPI.createBlock(data)
        toast({
          title: "Farm block added",
          description: "The farm block has been successfully added.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save farm block",
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
          <Label htmlFor="name">Block Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            placeholder="e.g., North Field, Block A"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={loading}
            placeholder="GPS coordinates or description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size_acres">Size (acres)</Label>
          <Input
            id="size_acres"
            type="number"
            step="0.01"
            value={formData.size_acres}
            onChange={(e) => setFormData({ ...formData, size_acres: e.target.value })}
            disabled={loading}
            placeholder="Land size in acres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="soil_type">Soil Type</Label>
          <Input
            id="soil_type"
            value={formData.soil_type}
            onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
            disabled={loading}
            placeholder="e.g., Clay, Loam, Sandy"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="irrigation_type">Irrigation Type</Label>
          <Input
            id="irrigation_type"
            value={formData.irrigation_type}
            onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
            disabled={loading}
            placeholder="e.g., Drip, Sprinkler, Rain-fed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_crop">Current Crop</Label>
          <Input
            id="current_crop"
            value={formData.current_crop}
            onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
            disabled={loading}
            placeholder="Currently planted crop"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
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
              <SelectItem value="fallow">Fallow</SelectItem>
              <SelectItem value="maintenance">Under Maintenance</SelectItem>
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
          placeholder="Additional information about the farm block"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : block ? (
            "Update Block"
          ) : (
            "Add Block"
          )}
        </Button>
      </div>
    </form>
  )
}
