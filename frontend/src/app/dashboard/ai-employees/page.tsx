'use client';

import React, { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  tools: string;
  created: string;
}

const defaultEmployees = [
  { name: 'CEO AI', role: 'CEO', systemPrompt: 'You are the visionary CEO of MarketingPilot AI...', tools: '[]' },
  { name: 'Max Market', role: 'Marketing Manager', systemPrompt: 'You design campaigns...', tools: '[]' },
  { name: 'Sam SEO', role: 'SEO Specialist', systemPrompt: 'You optimize content for search engines.', tools: '[]' },
  { name: 'Chris Content', role: 'Content Writer', systemPrompt: 'You write engaging blog posts.', tools: '[]' },
  { name: 'Sally Sales', role: 'Sales Manager', systemPrompt: 'You manage leads and conversions.', tools: '[]' }
];

export default function AIEmployeesPage() {
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', systemPrompt: '', tools: '[]' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('ai_employees').getFullList<AIEmployee>({
        sort: '-created',
      });
      setEmployees(records);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const seedDefaultEmployees = async () => {
    try {
      setLoading(true);
      for (const emp of defaultEmployees) {
        await pb.collection('ai_employees').create(emp);
      }
      await fetchEmployees();
    } catch (error) {
      console.error('Error seeding employees:', error);
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await pb.collection('ai_employees').create(newEmployee);
      setIsDialogOpen(false);
      setNewEmployee({ name: '', role: '', systemPrompt: '', tools: '[]' });
      await fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI employee?')) return;
    try {
      await pb.collection('ai_employees').delete(id);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Bot className="h-5 w-5 text-blue-600" /></span>
            AI Employees
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your autonomous AI workforce.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {employees.length === 0 && !loading && (
            <Button variant="secondary" onClick={seedDefaultEmployees} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Seed Default Employees
            </Button>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Employee
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px] border border-slate-200 bg-white">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Create AI Employee</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Configure a new specialized AI role for your agency.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-600">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Max Market"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      required
                      className="border-slate-200 bg-slate-50 text-slate-700 focus-visible:ring-blue-400/40"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-600">Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Marketing Manager"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      required
                      className="border-slate-200 bg-slate-50 text-slate-700 focus-visible:ring-blue-400/40"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="systemPrompt" className="text-slate-600">System Prompt</Label>
                    <Input
                      id="systemPrompt"
                      placeholder="You are an expert in..."
                      value={newEmployee.systemPrompt}
                      onChange={(e) => setNewEmployee({ ...newEmployee, systemPrompt: e.target.value })}
                      required
                      className="border-slate-200 bg-slate-50 text-slate-700 focus-visible:ring-blue-400/40"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tools" className="text-slate-600">Tools (JSON array)</Label>
                    <Input
                      id="tools"
                      placeholder="['search', 'write']"
                      value={newEmployee.tools}
                      onChange={(e) => setNewEmployee({ ...newEmployee, tools: e.target.value })}
                      className="border-slate-200 bg-slate-50 text-slate-700 focus-visible:ring-blue-400/40"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Save Employee'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <CardTitle className="text-slate-900">Active Workforce</CardTitle>
          <CardDescription className="text-slate-500">
            A list of all AI agents currently configured in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No AI employees found.</p>
              <p className="text-sm mt-1">Seed the defaults or create a new one to get started.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50 hover:bg-slate-50">
                  <TableRow className="border-slate-100">
                    <TableHead className="text-slate-500">Name</TableHead>
                    <TableHead className="text-slate-500">Role</TableHead>
                    <TableHead className="text-slate-500 hidden md:table-cell">Prompt</TableHead>
                    <TableHead className="text-slate-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60">
                      <TableCell className="font-medium text-slate-800">{employee.name}</TableCell>
                      <TableCell className="text-slate-500">
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {employee.role}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-sm text-slate-400 md:table-cell">
                        {employee.systemPrompt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
