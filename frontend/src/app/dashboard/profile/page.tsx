"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Upload, Save } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          <User className="h-8 w-8 text-primary" /> Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and preferences.</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <Button variant="outline" className="bg-white/5 border-white/10"><Upload className="mr-2 h-4 w-4" /> Change Photo</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="Ganesh" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" defaultValue="ganesh@marketingpilot.ai" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+1 (555) 000-0000" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <select className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <option value="pst">Pacific Time (PT)</option>
                <option value="est">Eastern Time (ET)</option>
                <option value="utc">UTC</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-white/5 border-t border-white/10 px-6 py-4">
          <Button className="ml-auto bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
