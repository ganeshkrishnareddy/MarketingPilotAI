"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Save, Loader2, Target, Globe, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { pb } from "@/lib/pocketbase"

const COLLECTION = "business_workspace"

const fetchBusinessProfile = async () => {
  const result = await pb.collection(COLLECTION).getList(1, 1).catch(() => ({ items: [] }))
  return result.items?.[0] || null
}

const saveBusinessProfile = async (data: any) => {
  const existing = await pb.collection(COLLECTION).getList(1, 1).catch(() => ({ items: [] }))
  if (existing.items?.[0]) {
    return pb.collection(COLLECTION).update(existing.items[0].id, data)
  }
  return pb.collection(COLLECTION).create(data)
}

export default function BusinessProfilePage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["businessProfile"],
    queryFn: fetchBusinessProfile,
    retry: false, // Don't retry infinitely on 404
  })

  const { mutate, isPending } = useMutation({
    mutationFn: saveBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile"] })
      toast.success("Business profile saved successfully!")
    },
    onError: () => {
      toast.error("Failed to save business profile. Is the backend running?")
    }
  })

  const [formData, setFormData] = React.useState({
    name: "",
    industry: "",
    website_url: "",
    target_audience: "",
    location: "",
    monthly_budget: "",
  })

  // Update local state when profile is fetched
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        industry: profile.industry || "",
        website_url: profile.website_url || "",
        target_audience: profile.target_audience || "",
        location: profile.location || "",
        monthly_budget: profile.monthly_budget || "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your business profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" /> Business Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your core business information. This data helps our AI understand who you are and who you serve.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Basic information about your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" /> Company Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Acme Corp" 
                  className="border-slate-200 bg-slate-50" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" /> Industry
                </Label>
                <Input 
                  id="industry" 
                  placeholder="e.g. SaaS, E-commerce, Local Service" 
                  className="border-slate-200 bg-slate-50"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url" className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground" /> Website URL
                </Label>
                <Input 
                  id="website_url" 
                  type="url" 
                  placeholder="https://..." 
                  className="border-slate-200 bg-slate-50"
                  value={formData.website_url}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  Location
                </Label>
                <Input 
                  id="location" 
                  placeholder="e.g. New York, USA" 
                  className="border-slate-200 bg-slate-50"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label htmlFor="target_audience" className="text-base font-semibold">Target Audience</Label>
              <p className="text-xs text-muted-foreground mb-3">Who is your ideal customer? Be as specific as possible.</p>
              <Input 
                id="target_audience" 
                placeholder="e.g. Marketing agencies looking for automation tools" 
                className="border-slate-200 bg-slate-50"
                value={formData.target_audience}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
               <Label htmlFor="monthly_budget" className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground" /> Monthly Marketing Budget
                </Label>
                <Input 
                  id="monthly_budget" 
                  type="number"
                  placeholder="e.g. 5000" 
                  className="border-slate-200 bg-slate-50 max-w-xs text-slate-700"
                  value={formData.monthly_budget}
                  onChange={handleChange}
                />
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-slate-100 px-6 py-4">
            <Button type="submit" disabled={isPending} className="ml-auto bg-primary hover:bg-primary/90">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
