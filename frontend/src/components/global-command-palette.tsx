"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { pb } from "@/lib/pocketbase"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Search, User, Users, Box, Plus, Bot, Workflow, FileText, Download } from "lucide-react"

export function GlobalCommandPalette({ variant = "default" }: { variant?: "default" | "header" }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<{contacts: any[], leads: any[], companies: any[]}>({ contacts: [], leads: [], companies: [] })
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults({ contacts: [], leads: [], companies: [] })
        return
      }
      try {
        const q = query.trim()
        const [contactsRes, leadsRes, companiesRes] = await Promise.all([
          pb.collection('contacts').getList(1, 5, { filter: `name ~ "${q}" || email ~ "${q}"`, requestKey: null }),
          pb.collection('leads').getList(1, 5, { filter: `name ~ "${q}" || email ~ "${q}"`, requestKey: null }),
          pb.collection('companies').getList(1, 5, { filter: `name ~ "${q}"`, requestKey: null })
        ]).catch(e => {
            console.log(e);
            return [ {items:[]}, {items:[]}, {items:[]} ];
        })
        setResults({
          contacts: contactsRes?.items || [],
          leads: leadsRes?.items || [],
          companies: companiesRes?.items || []
        })
      } catch (err) {
        console.error("Failed to search", err)
      }
    }

    const debounce = setTimeout(() => {
      fetchResults()
    }, 300)
    
    return () => clearTimeout(debounce)
  }, [query])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      {variant === "header" ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-400 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-100"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="flex-1 truncate">Search anything...</span>
          <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-flex">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline-flex text-xs font-medium">Search... (⌘K)</span>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search contacts, leads, companies..." 
          value={query} 
          onValueChange={setQuery} 
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {results.contacts.length > 0 && (
            <CommandGroup heading="Contacts">
              {results.contacts.map((contact: any) => (
                <CommandItem
                  key={contact.id}
                  value={`contact-${contact.id}`}
                  onSelect={() => runCommand(() => router.push(`/dashboard/contacts/${contact.id}`))}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{contact.name || contact.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.leads.length > 0 && (
            <CommandGroup heading="Leads">
              {results.leads.map((lead: any) => (
                <CommandItem
                  key={lead.id}
                  value={`lead-${lead.id}`}
                  onSelect={() => runCommand(() => router.push(`/dashboard/leads/${lead.id}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{lead.name || lead.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.companies.length > 0 && (
            <CommandGroup heading="Companies">
              {results.companies.map((company: any) => (
                <CommandItem
                  key={company.id}
                  value={`company-${company.id}`}
                  onSelect={() => runCommand(() => router.push(`/dashboard/companies/${company.id}`))}
                >
                  <Box className="mr-2 h-4 w-4" />
                  <span>{company.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length === 0 && (
             <CommandGroup heading="Quick Actions">
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/leads'))}>
                 <Plus className="mr-2 h-4 w-4 text-green-400" />
                 <span>Create Lead</span>
               </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/workflows'))}>
                 <Workflow className="mr-2 h-4 w-4 text-blue-400" />
                 <span>Start Workflow</span>
               </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/playground'))}>
                 <Bot className="mr-2 h-4 w-4 text-indigo-400" />
                 <span>Run AI Chat</span>
               </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/proposals'))}>
                 <FileText className="mr-2 h-4 w-4 text-amber-400" />
                 <span>Create Proposal</span>
               </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/workspace'))}>
                 <Download className="mr-2 h-4 w-4 text-emerald-400" />
                 <span>Import Business Profile</span>
               </CommandItem>
             </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
