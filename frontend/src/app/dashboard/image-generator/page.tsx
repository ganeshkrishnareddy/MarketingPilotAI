"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  Loader2,
  Settings2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STYLES = ["Realistic", "Cartoon", "3D", "Minimalist"] as const;
const ASPECT_RATIOS = ["1:1", "16:9", "9:16"] as const;
const QUALITIES = ["Standard", "HD"] as const;

type Style = (typeof STYLES)[number];
type AspectRatio = (typeof ASPECT_RATIOS)[number];
type Quality = (typeof QUALITIES)[number];

interface GeneratedImage {
  id: number;
  ready: boolean;
}

const INITIAL_IMAGES: GeneratedImage[] = [
  { id: 1, ready: false },
  { id: 2, ready: false },
  { id: 3, ready: false },
  { id: 4, ready: false },
];

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("Realistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality] = useState<Quality>("Standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setImages(INITIAL_IMAGES.map((img) => ({ ...img, ready: false })));
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setImages(INITIAL_IMAGES.map((img) => ({ ...img, ready: true })));
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const aspectRatioClass: Record<AspectRatio, string> = {
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <ImageIcon className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Image Generator</h1>
          <p className="text-sm text-slate-400">Turn your ideas into stunning visuals with AI</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border border-slate-200/80 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Settings2 className="h-4 w-4 text-purple-400" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Prompt */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Prompt</Label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate… e.g. 'A futuristic cityscape at sunset with neon lights and flying cars'"
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 resize-none transition"
                />
                <p className="text-xs text-slate-500">{prompt.length}/1000 characters — be specific for best results</p>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as Style)}>
                  <SelectTrigger className="border-slate-200 bg-slate-50 text-slate-700 focus:ring-purple-400/40">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="border border-slate-200 bg-white text-slate-900">
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s} className="focus:bg-slate-100 focus:text-slate-900">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Aspect Ratio</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`rounded-lg border py-2 text-sm font-medium transition ${
                        aspectRatio === ratio
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300 hover:text-slate-900"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Quality</Label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`rounded-lg border py-2 text-sm font-medium transition ${
                        quality === q
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300 hover:text-slate-900"
                      }`}
                    >
                      {q}
                      {q === "HD" && (
                        <span className="ml-1.5 text-[10px] bg-purple-600/40 text-purple-300 px-1 rounded">PRO</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Images…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Images
                  </>
                )}
              </Button>

              {isGenerating && (
                <p className="text-center text-xs text-slate-500">
                  Creating 4 unique variations — this may take 10–30 seconds
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="rounded-2xl border border-slate-200/80 bg-white">
            <CardContent className="pt-4 pb-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Prompt Tips</p>
              <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
                <li>Include lighting: "golden hour", "studio lighting"</li>
                <li>Mention camera: "shot on DSLR", "macro lens"</li>
                <li>Specify mood: "dreamy", "high contrast", "moody"</li>
                <li>Add style refs: "in the style of Art Nouveau"</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Image Grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <LayoutGrid className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Generated Images</span>
              {hasGenerated && <span className="text-xs text-slate-500">(4 variations)</span>}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasGenerated}
              className="border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Download All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className={`glass-card relative rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden group ${aspectRatioClass[aspectRatio]}`}
              >
                {!img.ready ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {isGenerating ? (
                      <>
                        <div className="h-10 w-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <p className="text-xs text-slate-500">Generating…</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-slate-600" />
                        <p className="text-xs text-slate-600">Image {img.id} will appear here</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(${135 + img.id * 45}deg, hsl(${260 + img.id * 20}, 60%, 25%) 0%, hsl(${300 + img.id * 15}, 50%, 15%) 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-60">
                      <ImageIcon className="h-8 w-8 text-white/40" />
                      <p className="text-[11px] text-white/40">Variation {img.id}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/20 text-xs">
                        <Download className="mr-1.5 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {hasGenerated && (
            <Card className="rounded-2xl border border-emerald-200 bg-emerald-50">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-green-400">4 images generated successfully</p>
                </div>
                <p className="text-xs text-slate-500">Style: {style} · {aspectRatio} · {quality}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
