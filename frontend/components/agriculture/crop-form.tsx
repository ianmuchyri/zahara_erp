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

interface CropFormProps {
  crop?: any
  onSuccess: () => void
}

export function CropForm({ crop, onSuccess }: CropFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    season: "",
    planting_date: "",
    harvest_date: "",
    expected_yield: "",
    status: "planning",
    notes: "",
  })

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || "",
        variety: crop.variety || "",
        season: crop.season || "",
        planting_date: crop.planting_date?.split("T")[0] || "",
        harvest_date: crop.harvest_date?.split("T")[0] || "",
        expected_yield: crop.expected_yield?.toString() || "",
        status: crop.status || "planning",
        notes: crop.notes || "",
      })
    }
  }, [crop])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        expected_yield: formData.expected_yield ? Number.parseFloat(formData.expected_yield) : null,
      }

      if (crop) {
        await agricultureAPI.updateCrop(crop.id, data)
        toast({
          title: "Crop updated",
          description: "The crop has been successfully updated.",
        })
      } else {
        await agricultureAPI.createCrop(data)
        toast({
          title: "Crop added",
          description: "The crop has been successfully added.",
        })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save crop",
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
          <Label htmlFor="name">Crop Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
            placeholder="e.g., Maize, Wheat, Coffee"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input
            id="variety"
            value={formData.variety}
            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
            disabled={loading}
            placeholder="Crop variety or cultivar"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <Input
            id="season"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            disabled={loading}
            placeholder="e.g., Spring 2024, Rainy Season"
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
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="planted">Planted</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="harvested">Harvested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="planting_date">Planting Date</Label>
          <Input
            id="planting_date"
            type="date"
            value={formData.planting_date}
            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvest_date">Expected Harvest Date</Label>
          <Input
            id="harvest_date"
            type="date"
            value={formData.harvest_date}
            onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="expected_yield">Expected Yield (kg)</Label>
          <Input
            id="expected_yield"
            type="number"
            step="0.01"
            value={formData.expected_yield}
            onChange={(e) => setFormData({ ...formData, expected_yield: e.target.value })}
            disabled={loading}
            placeholder="Expected yield in kilograms"
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
          placeholder="Additional information about the crop"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : crop ? (
            "Update Crop"
          ) : (
            "Add Crop"
          )}
        </Button>
      </div>
    </form>
  )
}
