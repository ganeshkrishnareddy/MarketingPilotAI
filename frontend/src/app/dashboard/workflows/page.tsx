"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { pb } from "@/lib/pocketbase";
import {
  Workflow,
  Plus,
  Mail,
  Share2,
  Tag,
  BarChart2,
  Clock,
  Zap,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  ArrowDown,
  Save,
  Trash2,
  GitBranch,
  Settings
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

interface WorkflowItem {
  id: number;
  name: string;
  description: string;
  trigger: string;
  lastRun: string;
  active: boolean;
  icon: React.ReactNode;
  color: string;
}

const initialWorkflows: WorkflowItem[] = [];

type NodeType = "trigger" | "condition" | "action";

interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  config: Record<string, string>;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [isBuilding, setIsBuilding] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: "1", type: "trigger", name: "New Lead Created", config: {} }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleWorkflow = (id: number) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const addNode = (type: NodeType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNodes((prev) => [...prev, { id, type, name: "Select " + type, config: {} }]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNode = (id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        nodes: nodes,
        active: true,
      };
      await pb.collection("ai_workflows").create(payload);
      toast.success("Workflow saved successfully!");
      setIsBuilding(false);
      // Mock adding to list
      setWorkflows(prev => [
        ...prev,
        {
          id: Date.now(),
          name: workflowName,
          description: "Custom built workflow",
          trigger: nodes[0]?.name || "Custom Trigger",
          lastRun: "Never",
          active: true,
          icon: <Workflow className="h-5 w-5" />,
          color: "from-indigo-500/20 to-purple-500/10"
        }
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save workflow. Is PocketBase running?");
    } finally {
      setIsSaving(false);
    }
  };

  if (isBuilding) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsBuilding(false)}>
              Back
            </Button>
            <Input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 shadow-none w-[300px]"
              placeholder="Workflow Name"
            />
          </div>
          <Button onClick={saveWorkflow} disabled={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Workflow"}
          </Button>
        </div>

        <div className="flex flex-col items-center py-10">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center w-full max-w-xl group">
              <Card className="w-full relative glass-card border-white/10 hover:border-white/20 transition-all duration-300">
                {index > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeNode(node.id)}
                    className="absolute -right-12 top-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className={`p-2 rounded-lg border ${
                    node.type === 'trigger' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    node.type === 'condition' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {node.type === 'trigger' ? <Zap className="h-4 w-4" /> :
                     node.type === 'condition' ? <GitBranch className="h-4 w-4" /> :
                     <PlayCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                      {node.type}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Select 
                    value={node.name}
                    onValueChange={(val) => updateNode(node.id, { name: val || "" })}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {node.type === 'trigger' && (
                        <>
                          <SelectItem value="New Lead Created">New Lead Created</SelectItem>
                          <SelectItem value="Form Submitted">Form Submitted</SelectItem>
                          <SelectItem value="Email Opened">Email Opened</SelectItem>
                        </>
                      )}
                      {node.type === 'condition' && (
                        <>
                          <SelectItem value="Score > 80">Lead Score &gt; 80</SelectItem>
                          <SelectItem value="Tag includes VIP">Tag includes VIP</SelectItem>
                          <SelectItem value="Status is Active">Status is Active</SelectItem>
                        </>
                      )}
                      {node.type === 'action' && (
                        <>
                          <SelectItem value="Assign to Sales AI">Assign to Sales AI</SelectItem>
                          <SelectItem value="Send Email">Send Email</SelectItem>
                          <SelectItem value="Update Lead Score">Update Lead Score</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  {node.type === 'action' && node.name === 'Send Email' && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Settings className="h-3 w-3" /> Configuration
                      </div>
                      <Input 
                        placeholder="Template ID" 
                        className="bg-white/5 border-white/10"
                        value={node.config.templateId || ''}
                        onChange={e => updateNode(node.id, { config: { ...node.config, templateId: e.target.value }})}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connecting Line & Arrow */}
              {index < nodes.length - 1 && (
                <div className="flex flex-col items-center justify-center my-2">
                  <div className="h-8 w-px bg-indigo-500/50"></div>
                  <ArrowDown className="h-4 w-4 text-indigo-500/50 -mt-2" />
                </div>
              )}
            </div>
          ))}

          {/* Add Node Buttons */}
          <div className="flex flex-col items-center mt-6">
            <div className="h-8 w-px bg-slate-700/50 mb-2"></div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-dashed border-slate-600 hover:border-blue-500 hover:text-blue-400 bg-transparent"
                onClick={() => addNode('condition')}
              >
                <GitBranch className="h-4 w-4 mr-2" /> Add Condition
              </Button>
              <Button 
                variant="outline" 
                className="border-dashed border-slate-600 hover:border-emerald-500 hover:text-emerald-400 bg-transparent"
                onClick={() => addNode('action')}
              >
                <PlayCircle className="h-4 w-4 mr-2" /> Add Action
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = workflows.filter((w) => w.active).length;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Workflow className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold  tracking-tight text-slate-900">
              Automation Workflows
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {activeCount} of {workflows.length} workflows active
            </p>
          </div>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-500/20"
          onClick={() => setIsBuilding(true)}
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Workflows", value: workflows.length, icon: <Workflow className="h-4 w-4 text-indigo-400" /> },
          { label: "Active", value: activeCount, icon: <PlayCircle className="h-4 w-4 text-green-400" /> },
          { label: "Runs Today", value: 0, icon: <Zap className="h-4 w-4 text-amber-400" /> },
          { label: "Avg. Run Time", value: "—", icon: <Clock className="h-4 w-4 text-cyan-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              {stat.icon}
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Workflow Cards */}
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`glass-panel rounded-2xl p-5 bg-gradient-to-r ${workflow.color} border border-white/10 transition-all duration-300 hover:border-white/20`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-white mt-0.5 shrink-0">
                  {workflow.icon}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-slate-900">
                      {workflow.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={
                        workflow.active
                          ? "border-green-500/50 text-green-400 bg-green-500/10 text-xs"
                          : "border-slate-500/50 text-slate-400 bg-slate-500/10 text-xs"
                      }
                    >
                      {workflow.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {workflow.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-slate-300 font-medium">Trigger:</span>{" "}
                      {workflow.trigger}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-slate-300 font-medium">Last run:</span>{" "}
                      {workflow.lastRun}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWorkflow(workflow.id)}
                  className={`gap-1.5 text-xs border ${
                    workflow.active
                      ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                      : "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  } bg-transparent`}
                >
                  {workflow.active ? (
                    <>
                      <PauseCircle className="h-3.5 w-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5" /> Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
