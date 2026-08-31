import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Zap, BarChart, History, Pin, Play, Download, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AnalysisPage() {
  return (
    <div className="flex-1 h-[calc(100vh-4rem)] p-4 md:p-6 bg-gradient-to-br from-background via-background to-secondary/10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-[1600px] mx-auto">
        
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">AI Analysis</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Ask AI to analyze anything..." className="pl-9 bg-background/50 backdrop-blur-sm" />
            </div>
          </div>

          <Card className="flex-1 border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-lg flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-3">
                {[
                  { title: "Generate SWOT", desc: "Analyze strengths & weaknesses", icon: BarChart, color: "text-blue-500" },
                  { title: "Marketing Plan", desc: "Full Q3 strategy document", icon: FileText, color: "text-green-500" },
                  { title: "SEO Audit", desc: "Technical & content review", icon: Search, color: "text-purple-500" },
                ].map((action, i) => (
                  <button key={i} className="w-full text-left p-4 rounded-xl border border-slate-100 bg-background/40 hover:bg-background/80 transition-all hover:shadow-md group flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-background ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Viewer */}
        <div className="lg:col-span-6 h-full flex flex-col">
          <Card className="flex-1 border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-background/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                  <BarChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Competitor Analysis Report</h3>
                  <p className="text-xs text-muted-foreground">Generated 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                <Button size="sm" className="gap-2"><Play className="w-4 h-4" /> Regenerate</Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6 lg:p-10">
              <div className="max-w-2xl mx-auto space-y-8 prose prose-slate dark:prose-invert">
                <div className="space-y-4">
                  <div className="flex gap-2 mb-6">
                    <Badge variant="secondary">Analysis</Badge>
                    <Badge variant="secondary">Competitors</Badge>
                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">High Confidence</Badge>
                  </div>
                  <h1 className="text-3xl font-bold">Q3 Competitor Landscape</h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    This report analyzes the top 3 competitors in your sector, identifying key marketing gaps and opportunities for immediate exploitation.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> Key Opportunity
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Competitor A is heavily indexing on paid search but lacks a cohesive organic content strategy. There is a 45% gap in long-tail keyword coverage that your brand can capture within 60 days.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background/50 border border-slate-100">
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Threat Level</h4>
                      <p className="text-2xl font-bold text-amber-500">Medium</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-slate-100">
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Market Share</h4>
                      <p className="text-2xl font-bold">14.2%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                    <ul className="space-y-3">
                      {[
                        "Double down on educational blog content targeting 'How-to' queries.",
                        "Launch retargeting campaign against Competitor B's pricing page visitors.",
                        "Optimize technical SEO on product pages for better core web vitals."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">{i+1}</div>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-3 h-full">
          <Card className="h-full border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-lg flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> History
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Pin className="w-3.5 h-3.5" /> Pinned
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Annual SEO Audit 2025",
                      "Brand Guidelines Review"
                    ].map((title, i) => (
                      <div key={i} className="p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 cursor-pointer text-sm font-medium">
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent</h4>
                  <div className="space-y-2">
                    {[
                      { title: "Competitor Analysis Report", time: "2 hours ago" },
                      { title: "Q2 Marketing Strategy", time: "Yesterday" },
                      { title: "Social Media Sentiment", time: "3 days ago" },
                      { title: "Content Gap Analysis", time: "Last week" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-lg hover:bg-background/80 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <div className="text-sm font-medium mb-1">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>

      </div>
    </div>
  );
}
