"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { agricultureAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CropForm } from "@/components/agriculture/crop-form"
import { BlockForm } from "@/components/agriculture/block-form"

export default function AgriculturePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateCropOpen, setIsCreateCropOpen] = useState(false)
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false)
  const [editingCrop, setEditingCrop] = useState<any>(null)
  const [editingBlock, setEditingBlock] = useState<any>(null)
  const { toast } = useToast()

  const {
    data: crops,
    isLoading: cropsLoading,
    mutate: mutateCrops,
  } = useSWR("/crops", () => agricultureAPI.getCrops({ search: searchQuery }).then((res) => res.data))

  const {
    data: blocks,
    isLoading: blocksLoading,
    mutate: mutateBlocks,
  } = useSWR("/blocks", () => agricultureAPI.getBlocks({ search: searchQuery }).then((res) => res.data))

  const handleDeleteCrop = async (id: number) => {
    if (!confirm("Are you sure you want to delete this crop?")) return

    try {
      await agricultureAPI.deleteCrop(id)
      mutateCrops()
      toast({
        title: "Crop deleted",
        description: "The crop has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete crop",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBlock = async (id: number) => {
    if (!confirm("Are you sure you want to delete this farm block?")) return

    try {
      await agricultureAPI.deleteBlock(id)
      mutateBlocks()
      toast({
        title: "Farm block deleted",
        description: "The farm block has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete farm block",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Agriculture Management</h1>
          <p className="text-muted-foreground">Manage crops and farm blocks</p>
        </div>
      </div>

      <Tabs defaultValue="crops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="blocks">Farm Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search crops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isCreateCropOpen} onOpenChange={setIsCreateCropOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Add New Crop</DialogTitle>
                  <DialogDescription>Create a new crop record</DialogDescription>
                </DialogHeader>
                <CropForm
                  onSuccess={() => {
                    mutateCrops()
                    setIsCreateCropOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Crop Management</CardTitle>
              <CardDescription>Track crop varieties and growing information</CardDescription>
            </CardHeader>
            <CardContent>
              {cropsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : crops?.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No crops found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop Name</TableHead>
                        <TableHead>Variety</TableHead>
                        <TableHead>Season</TableHead>
                        <TableHead>Planting Date</TableHead>
                        <TableHead>Harvest Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crops?.map((crop: any) => (
                        <TableRow key={crop.id}>
                          <TableCell className="font-medium">{crop.name}</TableCell>
                          <TableCell>{crop.variety}</TableCell>
                          <TableCell>{crop.season}</TableCell>
                          <TableCell>
                            {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            {crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={crop.status === "harvested" ? "default" : "secondary"}
                              className={
                                crop.status === "growing"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : crop.status === "harvested"
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                    : ""
                              }
                            >
                              {crop.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setEditingCrop(crop)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCrop(crop.id)}>
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
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search farm blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isCreateBlockOpen} onOpenChange={setIsCreateBlockOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Farm Block
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Add New Farm Block</DialogTitle>
                  <DialogDescription>Create a new farm block record</DialogDescription>
                </DialogHeader>
                <BlockForm
                  onSuccess={() => {
                    mutateBlocks()
                    setIsCreateBlockOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Farm Block Management</CardTitle>
              <CardDescription>Track farm land parcels and their usage</CardDescription>
            </CardHeader>
            <CardContent>
              {blocksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : blocks?.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No farm blocks found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Block Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Size (acres)</TableHead>
                        <TableHead>Soil Type</TableHead>
                        <TableHead>Current Crop</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocks?.map((block: any) => (
                        <TableRow key={block.id}>
                          <TableCell className="font-medium">{block.name}</TableCell>
                          <TableCell>{block.location}</TableCell>
                          <TableCell>{block.size_acres}</TableCell>
                          <TableCell>{block.soil_type}</TableCell>
                          <TableCell>{block.current_crop || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={block.status === "active" ? "default" : "secondary"}>{block.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setEditingBlock(block)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBlock(block.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <Dialog open={!!editingCrop} onOpenChange={() => setEditingCrop(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Crop</DialogTitle>
            <DialogDescription>Update crop information</DialogDescription>
          </DialogHeader>
          <CropForm
            crop={editingCrop}
            onSuccess={() => {
              mutateCrops()
              setEditingCrop(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Farm Block</DialogTitle>
            <DialogDescription>Update farm block information</DialogDescription>
          </DialogHeader>
          <BlockForm
            block={editingBlock}
            onSuccess={() => {
              mutateBlocks()
              setEditingBlock(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
