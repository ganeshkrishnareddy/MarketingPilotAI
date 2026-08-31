"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Plus, Search, Loader2, Edit, Trash2 } from "lucide-react"
import { pb } from "@/lib/pocketbase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: ""
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const records = await pb.collection('contacts').getFullList({ sort: '-created' })
        setContacts(records)
      } catch (err) {
        console.error("Failed to fetch contacts", err)
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
    
    pb.collection('contacts').subscribe('*', function (e) {
      if (e.action === 'create') setContacts(prev => [e.record, ...prev])
      if (e.action === 'delete') setContacts(prev => prev.filter(c => c.id !== e.record.id))
      if (e.action === 'update') setContacts(prev => prev.map(c => c.id === e.record.id ? e.record : c))
    })

    return () => { pb.collection('contacts').unsubscribe('*') }
  }, [])

  const filteredContacts = contacts.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.first_name || "").toLowerCase().includes(term) ||
      (c.last_name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term) ||
      (c.company || "").toLowerCase().includes(term) ||
      (c.phone || "").toLowerCase().includes(term)
    );
  })

  const handleOpenDialog = (contact?: any) => {
    if (contact) {
      setEditingId(contact.id)
      setFormData({
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || ""
      })
    } else {
      setEditingId(null)
      setFormData({ first_name: "", last_name: "", email: "", phone: "", company: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await pb.collection('contacts').update(editingId, formData)
      } else {
        await pb.collection('contacts').create(formData)
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to save contact", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await pb.collection('contacts').delete(id)
    } catch (err) {
      console.error("Failed to delete", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
            <User className="h-8 w-8 text-primary" /> Contacts Directory
          </h1>
          <p className="text-muted-foreground mt-2">Centralized address book for all business relationships.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search contacts..." 
              className="pl-8 bg-white/5 border-white/10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => handleOpenDialog()} type="button">
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSaveContact}>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Contact' : 'Create Contact'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="first_name" className="text-right">First Name</Label>
                    <Input id="first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="last_name" className="text-right">Last Name</Label>
                    <Input id="last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">Company</Label>
                    <Input id="company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No contacts found.</TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone || '-'}</TableCell>
                    <TableCell>{c.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(c)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-500/10" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

