"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Globe, MapPin, Briefcase, Loader2 } from "lucide-react";
import { pb } from "@/lib/pocketbase";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", industry: "", website: "", address: "" });

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const records = await pb.collection('companies').getFullList({ sort: '-created' });
        setCompanies(records);
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
    
    pb.collection('companies').subscribe('*', function (e) {
      if (e.action === 'create') setCompanies(prev => [e.record, ...prev]);
      if (e.action === 'delete') setCompanies(prev => prev.filter(c => c.id !== e.record.id));
      if (e.action === 'update') setCompanies(prev => prev.map(c => c.id === e.record.id ? e.record : c));
    });

    return () => { pb.collection('companies').unsubscribe('*'); }
  }, []);

  const handleCreate = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      await pb.collection('companies').create(formData);
      setFormData({ name: "", industry: "", website: "", address: "" });
      setOpen(false);
    } catch (err) {
      console.error("Failed to create company", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Building2 className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
            <p className="text-slate-400 text-sm">Manage your client organizations</p>
          </div>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white gap-2">
            <Plus className="h-4 w-4" /> Add Company
          </DialogTrigger>
          <DialogContent className="border border-slate-200 bg-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-400">Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-800/60 border-slate-600 focus:border-violet-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-slate-400">Industry</Label>
                <Input id="industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="bg-slate-800/60 border-slate-600 focus:border-violet-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-slate-400">Website</Label>
                <Input id="website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-slate-800/60 border-slate-600 focus:border-violet-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-400">Address</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-slate-800/60 border-slate-600 focus:border-violet-500" />
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              Create Company
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map(company => (
          <Card key={company.id} className="rounded-2xl border border-slate-200/80 bg-white transition-colors hover:border-violet-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg text-slate-900">
                {company.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Briefcase className="h-4 w-4 text-violet-400" /> {company.industry}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Globe className="h-4 w-4 text-blue-400" /> {company.website}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-emerald-400" /> {company.address}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
