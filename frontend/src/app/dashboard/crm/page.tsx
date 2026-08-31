"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PocketBase from 'pocketbase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const pb = new PocketBase('http://127.0.0.1:8090');

interface Deal {
  id: string;
  title: string;
  revenue: number;
  closeDate: string;
  stage: string;
  winLoss: 'open' | 'won' | 'lost';
}

const STAGES = ['Lead', 'Negotiation', 'Won', 'Lost'];

const SortableDealCard = ({ deal }: { deal: Deal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id, data: deal });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-3 border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="font-semibold text-gray-800 dark:text-gray-100">{deal.title}</div>
      <div className="text-sm text-gray-500 mt-2">Revenue: <span className="font-medium">${deal.revenue?.toLocaleString() ?? 0}</span></div>
      <div className="text-xs text-gray-400 mt-1">Close: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'TBD'}</div>
      {deal.winLoss !== 'open' && (
        <span className={`text-xs font-bold mt-3 inline-block px-2 py-1 rounded ${deal.winLoss === 'won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {deal.winLoss.toUpperCase()}
        </span>
      )}
    </div>
  );
};

const DroppableStage = ({ stage, deals }: { stage: string, deals: Deal[] }) => {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div className="min-w-0 w-full bg-muted/40 rounded-xl p-4 flex flex-col border border-transparent hover:border-border transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{stage}</h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm py-1 px-3 rounded-full font-medium">
          {deals.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[200px] min-w-0">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <SortableDealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default function CRMDealsPipeline() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({ stage: 'Lead', winLoss: 'open' });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const records = await pb.collection('deals').getFullList<Deal>({ sort: '-created' });
        setDeals(records);
      } catch (err) {
        console.error('PocketBase fetch failed:', err);
        setDeals([]);
      }
    };
    fetchDeals();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    
    let newStage = overId;
    if (!STAGES.includes(newStage)) {
       const overDeal = deals.find(d => d.id === overId);
       if (overDeal) newStage = overDeal.stage;
    }

    if (!STAGES.includes(newStage)) return;

    setDeals(prevDeals => prevDeals.map(deal => deal.id === dealId ? { ...deal, stage: newStage } : deal));

    try {
      await pb.collection('deals').update(dealId, { stage: newStage });
    } catch (err) {
      console.error('PocketBase update failed:', err);
    }
  };

  const handleAddDeal = async () => {
    try {
       const record = await pb.collection('deals').create<Deal>({
         ...newDeal,
         revenue: Number(newDeal.revenue) || 0,
       });
       setDeals(prev => [record, ...prev]);
    } catch (err) {
       console.error('PocketBase create failed:', err);
       setDeals(prev => [{ id: Date.now().toString(), ...newDeal, revenue: Number(newDeal.revenue) || 0 } as Deal, ...prev]);
    }
    setIsDialogOpen(false);
    setNewDeal({ stage: 'Lead', winLoss: 'open' });
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Deals Pipeline</h1>
          <p className="mt-1 text-muted-foreground">Manage and track your CRM deals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button size="lg" className="shadow-md hover:shadow-lg transition-all rounded-full px-6">+ Add Deal</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Deal</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4 mt-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Deal Title</label>
                <input type="text" placeholder="e.g., Enterprise License" className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={e => setNewDeal({...newDeal, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Expected Revenue</label>
                <input type="number" placeholder="e.g., 5000" className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={e => setNewDeal({...newDeal, revenue: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Close Date</label>
                <input type="date" className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={e => setNewDeal({...newDeal, closeDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Stage</label>
                  <select className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={e => setNewDeal({...newDeal, stage: e.target.value})} value={newDeal.stage}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Win/Loss</label>
                  <select className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={e => setNewDeal({...newDeal, winLoss: e.target.value as 'open'|'won'|'lost'})} value={newDeal.winLoss}>
                    <option value="open">Open</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddDeal} className="w-full mt-4" size="lg">Save Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-flow-col auto-cols-[minmax(18rem,1fr)] gap-6 overflow-x-auto pb-4 min-w-0">
          {STAGES.map(stage => (
            <DroppableStage key={stage} stage={stage} deals={deals.filter(d => d.stage === stage)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
