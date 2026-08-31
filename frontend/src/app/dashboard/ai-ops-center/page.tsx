'use client';

import React, { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Activity, 
  MessageSquare, 
  GitMerge, 
  CheckCircle2, 
  Clock, 
  PlayCircle,
  Network
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AIOpsCenter() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [tasks, setTasks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [graphJson, setGraphJson] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const records = await pb.collection('ai_projects').getFullList({
          sort: '-created',
        });
        setProjects(records);
        if (records.length > 0) {
          setSelectedProjectId(records[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch AI projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    
    async function fetchDetails() {
      setLoadingDetails(true);
      try {
        const [tasksRes, msgsRes] = await Promise.all([
          pb.collection('ai_tasks').getFullList({
            filter: `project_id="${selectedProjectId}"`,
            sort: 'created',
          }).catch(() => []),
          pb.collection('ai_messages').getFullList({
            filter: `project_id="${selectedProjectId}"`,
            sort: 'created',
          }).catch(() => [])
        ]);

        let graphRes = null;
        try {
          const graphs = await pb.collection('ai_execution_graph').getFullList({
            filter: `project_id="${selectedProjectId}"`,
          });
          if (graphs.length > 0) {
            graphRes = graphs[0].graph_json;
          }
        } catch(e) {
          console.log("No graph found or error fetching graph", e);
        }

        setTasks(tasksRes);
        setMessages(msgsRes);
        setGraphJson(graphRes);
      } catch (error) {
        console.error('Failed to fetch project details:', error);
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [selectedProjectId]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'running':
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Completed</Badge>;
      case 'running':
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Running</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 border-slate-200">Pending</Badge>;
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-6 p-6 overflow-hidden animate-in fade-in duration-500 bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* Left Sidebar - Projects List */}
      <Card className="w-1/4 h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 text-indigo-500" />
            AI Projects
          </CardTitle>
          <CardDescription>Select a project to view ops</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 flex flex-col gap-2">
              {loadingProjects ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : projects.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">No projects found.</div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`text-left p-4 rounded-xl transition-all duration-300 border ${
                      selectedProjectId === project.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate mb-1">
                      {project.name || 'Unnamed Project'}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(project.created).toLocaleDateString()}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Card className="flex-1 h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden">
        {loadingDetails ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Bot className="w-10 h-10 animate-bounce text-indigo-400" />
              <p>Loading project details...</p>
            </div>
          </div>
        ) : !selectedProject ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a project to view details
          </div>
        ) : (
          <React.Fragment>
            <CardHeader className="pb-0 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                    {selectedProject.name || 'Unnamed Project'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ID: {selectedProject.id}
                  </CardDescription>
                </div>
                {getStatusBadge(selectedProject.status)}
              </div>

              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 mb-0 rounded-b-none border-b-0 h-12">
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-t-lg rounded-b-none px-6 h-full gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Tasks
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-t-lg rounded-b-none px-6 h-full gap-2">
                    <MessageSquare className="w-4 h-4" /> Messages
                  </TabsTrigger>
                  <TabsTrigger value="graph" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-t-lg rounded-b-none px-6 h-full gap-2">
                    <Network className="w-4 h-4" /> Execution Graph
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
              <Tabs defaultValue="tasks" className="w-full h-full flex flex-col">
                <TabsContent value="tasks" className="m-0 h-full flex-col data-[state=active]:flex">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      {tasks.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No tasks found for this project.</div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/50 dark:bg-slate-900/50">
                          <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                              <TableRow>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Assigned Agent</TableHead>
                                <TableHead>Dependencies</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tasks.map((task) => (
                                <TableRow key={task.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                  <TableCell className="font-medium">
                                    {task.name || task.id}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Bot className="w-3 h-3" />
                                      </div>
                                      <span className="text-sm">{task.assigned_agent || 'Unassigned'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0 ? (
                                        task.dependencies.map((dep: string) => (
                                          <Badge key={dep} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                                            {dep}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-xs text-slate-400">None</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {getStatusIcon(task.status)}
                                      <span className="text-sm capitalize">{task.status || 'Pending'}</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="messages" className="m-0 h-full flex-col data-[state=active]:flex bg-slate-50/30 dark:bg-slate-950/30">
                  <ScrollArea className="h-full p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No agent messages yet.</div>
                      ) : (
                        messages.map((msg, i) => (
                          <div key={msg.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                                <Bot className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {msg.agent_from}
                                </span>
                                <GitMerge className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">
                                  {msg.agent_to}
                                </span>
                                <span className="text-xs text-slate-400 ml-auto">
                                  {new Date(msg.created).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                {typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload, null, 2)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="graph" className="m-0 h-full flex-col data-[state=active]:flex">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      {graphJson ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                          <pre className="text-slate-700 dark:text-slate-300">
                            {JSON.stringify(graphJson, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                          <Network className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                          <p>No execution graph data available for this project.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </React.Fragment>
        )}
      </Card>
    </div>
  );
}
