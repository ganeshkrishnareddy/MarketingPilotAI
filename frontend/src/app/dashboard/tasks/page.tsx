'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pb } from '@/lib/pocketbase';
import { Play, Loader2, CheckSquare } from 'lucide-react';
import { RecordModel } from 'pocketbase';

export default function TasksPage() {
  const [tasks, setTasks] = useState<RecordModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const records = await pb.collection('ai_tasks').getFullList({
        sort: '-created',
        expand: 'employee_id,workspace_id',
      });
      setTasks(records);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setIsProcessing(true);
      const pendingTasks = tasks.filter((t) => t.status === 'Pending');
      
      for (const task of pendingTasks) {
        await pb.collection('ai_tasks').update(task.id, {
          status: 'Completed',
        });
      }
      
      await fetchTasks();
    } catch (error) {
      console.error('Failed to process queue:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Running':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5">
            <CheckSquare className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Task Queue</h1>
            <p className="text-sm text-slate-500">Manage and monitor background AI tasks.</p>
          </div>
        </div>
        
        <Button 
          onClick={handleProcessQueue} 
          disabled={isProcessing || isLoading}
          className="gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {isProcessing ? 'Processing...' : 'Process Queue'}
        </Button>
      </div>
      
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <CardTitle className="text-slate-900">AI Tasks</CardTitle>
          <CardDescription className="text-slate-500">
            All background operations for workspaces and employees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-100 hover:bg-slate-50">
                  <TableHead className="text-slate-500">Title</TableHead>
                  <TableHead className="text-slate-500">Employee</TableHead>
                  <TableHead className="text-slate-500">Workspace</TableHead>
                  <TableHead className="text-slate-500">Priority</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-slate-500">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                      <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                      No tasks found in the queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} className="border-slate-100 hover:bg-slate-50/60">
                      <TableCell className="font-medium text-slate-800">{task.title}</TableCell>
                      <TableCell className="text-slate-500">{task.expand?.employee_id?.name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-500">{task.expand?.workspace_id?.name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-500">{task.priority || 'Medium'}</TableCell>
                      <TableCell>
                        <Badge className={`border font-medium ${getStatusColor(task.status)}`}>
                          {task.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-400">
                        {new Date(task.created).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
