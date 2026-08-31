"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneCall, Brain, BarChart3, Settings, Play, 
  PhoneOutgoing, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone,
  RefreshCw, AudioLines, MessageSquareText, Volume2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Analytics Data
const performanceData = [
  { name: 'Mon', calls: 45, answered: 32 },
  { name: 'Tue', calls: 52, answered: 38 },
  { name: 'Wed', calls: 38, answered: 25 },
  { name: 'Thu', calls: 65, answered: 48 },
  { name: 'Fri', calls: 48, answered: 35 },
  { name: 'Sat', calls: 25, answered: 18 },
  { name: 'Sun', calls: 30, answered: 22 },
];

const funnelData = [
  { name: 'Dialed', value: 303 },
  { name: 'Answered', value: 218 },
  { name: 'Qualified', value: 145 },
  { name: 'Converted', value: 89 },
];

type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';
type ProviderStatus = { status: string; detail?: string };

const VOICE_OPTIONS = [
  { id: 'rumik-mulberry', label: 'Rumik Silk Mulberry — Siya (Warm Indian Female)', desc: 'Natural-language voice description, 24kHz WAV' },
  { id: 'rumik-muga', label: 'Rumik Silk Muga (Expressive)', desc: 'Tone-tag steering like [happy], [neutral]' },
  { id: 'deepgram-aura-asteria-en', label: 'Deepgram Aura Asteria (US Female)', desc: 'Deepgram TTS fallback voice' },
];

export default function VoiceAiStudioPage() {
  const [activeTab, setActiveTab] = useState('talk');

  // Talk to It — real STT → LLM → TTS loop
  const [isLive, setIsLive] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [conversation, setConversation] = useState<{role: 'human' | 'agent', text: string}[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [roundTripMs, setRoundTripMs] = useState<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechSeenRef = useRef(false);
  const silenceMsRef = useRef(0);
  const speechMsRef = useRef(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const isLiveRef = useRef(false);

  // Agent Config
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Vision 360 AI, an elite outbound sales representative. Your goal is to qualify the lead and pitch our AI automation services starting at ₹2,000 per month. Keep your sentences short and conversational — under 2 sentences per reply. If they ask about pricing, emphasize the ROI. If they say they are busy, ask for a better time to call back."
  );
  const [voiceModel, setVoiceModel] = useState('rumik-mulberry');
  const [agentLang, setAgentLang] = useState('en');

  // Outbound Dialer
  const [dialNumber, setDialNumber] = useState("");
  const [carrier, setCarrier] = useState<'vobiz' | 'dograh'>('vobiz');
  const [isDialing, setIsDialing] = useState(false);
  const [callResult, setCallResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Provider status
  const [providerStatus, setProviderStatus] = useState<Record<string, ProviderStatus>>({});
  const [checkingProviders, setCheckingProviders] = useState(false);

  const pushHistory = (role: 'user' | 'assistant', content: string) => {
    historyRef.current = [...historyRef.current, { role, content }];
  };

  const stopSilenceWatch = () => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const speak = async (text: string): Promise<void> => {
    setAgentState('speaking');
    const ttsRes = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceModel, speaker: 'siya' }),
    });
    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({ error: 'TTS failed' }));
      throw new Error(err.error || 'TTS failed');
    }
    const buf = await ttsRes.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    const audio = new Audio(url);
    audioElRef.current?.pause();
    audioElRef.current = audio;
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
  };

  const restartListening = () => {
    if (!isLiveRef.current) return;
    setAgentState('listening');
    startRecorder();
  };

  const startRecorder = () => {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    speechSeenRef.current = false;
    silenceMsRef.current = 0;
    speechMsRef.current = 0;

    const mime = 'audio/webm;codecs=opus';
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, MediaRecorder.isTypeSupported(mime) ? { mimeType: mime } : undefined);
    } catch {
      rec = new MediaRecorder(stream);
    }
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
      chunksRef.current = [];
      if (blob.size > 1500) processUtterance(blob);
      else if (isLiveRef.current) setAgentState('listening');
    };
    rec.start(250);

    stopSilenceWatch();
    silenceTimerRef.current = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser || !isLiveRef.current) return;
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const threshold = 0.012;

      if (rms > threshold) {
        speechSeenRef.current = true;
        silenceMsRef.current = 0;
        speechMsRef.current += 250;
      } else {
        silenceMsRef.current += 250;
      }

      if (speechSeenRef.current && (silenceMsRef.current > 1700 || speechMsRef.current > 15000)) {
        // Utterance complete — flush it.
        stopSilenceWatch();
        const current = recorderRef.current;
        if (current && current.state !== 'inactive') {
          try { current.stop(); } catch { /* noop */ }
        }
      }
    }, 250);
  };

  const processUtterance = async (blob: Blob) => {
    if (!isLiveRef.current) return;
    setAgentState('thinking');
    try {
      const started = Date.now();
      const sttRes = await fetch('/api/voice/stt', {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/webm' },
        body: blob,
      });
      const stt = await sttRes.json();
      const transcript = (stt.transcript || '').trim();
      if (!transcript) {
        restartListening();
        return;
      }

      const humanMsg = { role: 'human' as const, text: transcript };
      setConversation(prev => [...prev, humanMsg]);
      pushHistory('user', transcript);

      const llmRes = await fetch('/api/voice/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: historyRef.current,
          model: 'llama-3.3-70b-versatile',
        }),
      });
      const llm = await llmRes.json();
      if (!llmRes.ok) throw new Error(llm.error || 'LLM failed');
      const reply = (llm.reply || '').trim();

      const agentMsg = { role: 'agent' as const, text: reply };
      setConversation(prev => [...prev, agentMsg]);
      pushHistory('assistant', reply);

      await speak(reply);
      setRoundTripMs(Date.now() - started);
      restartListening();
    } catch (err) {
      console.error('[Voice loop]', err);
      setConversation(prev => [...prev, { role: 'agent', text: `⚠️ ${(err as Error).message}` }]);
      restartListening();
    }
  };

  const stopLive = () => {
    isLiveRef.current = false;
    stopSilenceWatch();
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch { /* noop */ } }
    audioElRef.current?.pause();
    audioElRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;
    setIsLive(false);
    setAgentState('idle');
    setConversation([]);
    historyRef.current = [];
    setMicError(null);
  };

  const startLive = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not available in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      isLiveRef.current = true;
      setIsLive(true);
      setAgentState('speaking');
      setConversation([{ role: 'agent', text: "Hello! I'm Vision 360 AI, your business voice agent. How can I help you today?" }]);

      const greeting = "Hello! I'm Vision 360 AI, your business voice agent. How can I help you today?";
      pushHistory('assistant', greeting);
      await speak(greeting);
      restartListening();
    } catch (err) {
      console.error('[Voice mic]', err);
      setMicError((err as Error).message || 'Could not access the microphone.');
      setIsLive(false);
      setAgentState('idle');
    }
  };

  const checkProviders = async (full = false) => {
    setCheckingProviders(true);
    try {
      const res = await fetch(`/api/voice/providers${full ? '?full=1' : ''}`);
      const data = await res.json();
      setProviderStatus(data.providers || {});
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingProviders(false);
    }
  };

  useEffect(() => {
    checkProviders(false);
    return () => { stopLive(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateCall = async () => {
    if (!dialNumber) {
      setCallResult({ ok: false, message: "Please enter a phone number." });
      return;
    }
    setIsDialing(true);
    setCallResult(null);
    try {
      const response = await fetch('/api/voice/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: dialNumber, campaign: 'Vision 360 AI', carrier, lang: agentLang }),
      });
      const data = await response.json();
      if (response.ok) {
        setCallResult({ ok: true, message: `${data.message}${data.request_uuid ? ` (UUID ${data.request_uuid})` : ''}` });
      } else {
        setCallResult({ ok: false, message: data.error || "Unknown error" });
      }
    } catch (error) {
      setCallResult({ ok: false, message: "Error initiating call. Check console for details." });
      console.error(error);
    } finally {
      setIsDialing(false);
    }
  };

  const providerBadge = (key: string) => {
    const p = providerStatus[key];
    const status = p?.status || 'unknown';
    if (status === 'connected') {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Connected
        </span>
      );
    }
    if (status === 'configured') {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
          <Settings className="h-3.5 w-3.5" /> Configured
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" /> Error
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
        <AlertCircle className="h-3.5 w-3.5" /> {status === 'missing' ? 'Requires Setup' : 'Checking…'}
      </span>
    );
  };

  const providerCards = [
    { key: 'vobiz', name: 'VoBiz AI (Primary Carrier)', icon: <PhoneOutgoing className="h-5 w-5 text-emerald-600" />, desc: 'Indian PSTN routing and SIP trunking.', env: 'VOBIZ_AUTH_ID / VOBIZ_AUTH_TOKEN' },
    { key: 'deepgram', name: 'Deepgram STT', icon: <Mic className="h-5 w-5 text-blue-600" />, desc: 'Nova-3 Multilingual Speech-to-Text.', env: 'DEEPGRAM_API_KEY' },
    { key: 'groq', name: 'Groq Llama 3.3', icon: <Brain className="h-5 w-5 text-amber-600" />, desc: 'Low-latency logical processing brain.', env: 'GROQ_API_KEY' },
    { key: 'rumik', name: 'Rumik TTS', icon: <Volume2 className="h-5 w-5 text-rose-600" />, desc: 'Silk Mulberry/Muga Text-to-Speech.', env: 'RUMIK_API_KEY' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </span>
            Voice Agent Studio
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real voice agents: Deepgram STT → Groq brain → Rumik TTS, fired over Vobiz PSTN.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            View API Docs
          </button>
          <button className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
            Deploy Agent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {[
          { id: 'talk', label: 'Talk to It', icon: <Mic className="h-4 w-4" /> },
          { id: 'config', label: 'Vision 360 AI Agent', icon: <Brain className="h-4 w-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'telephony', label: 'Telephony & Providers', icon: <PhoneCall className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        
        {/* TALK TO IT — REAL STT → LLM → TTS LOOP */}
        {activeTab === 'talk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              {/* Dynamic Orb */}
              <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
                {isLive && agentState === 'speaking' && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                )}
                {isLive && agentState === 'listening' && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
                )}
                {isLive && agentState === 'thinking' && (
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-pulse" />
                )}
                
                <div className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full transition-all duration-500 shadow-2xl ${
                  !isLive ? 'bg-slate-100 border-4 border-slate-200' :
                  agentState === 'speaking' ? 'bg-gradient-to-br from-blue-400 to-indigo-600 border-4 border-blue-300 scale-110 shadow-[0_0_40px_rgba(59,130,246,0.4)]' :
                  agentState === 'listening' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-4 border-emerald-300 scale-100 shadow-[0_0_40px_rgba(16,185,129,0.3)]' :
                  agentState === 'thinking' ? 'bg-gradient-to-br from-violet-400 to-purple-600 border-4 border-violet-300 scale-100 shadow-[0_0_40px_rgba(139,92,246,0.3)]' :
                  'bg-gradient-to-br from-blue-400 to-indigo-600 border-4 border-blue-300 scale-100 animate-pulse shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                }`}>
                  {!isLive ? <MicOff className="h-12 w-12 text-slate-400" /> : <Mic className="h-12 w-12 text-white" />}
                </div>
              </div>

              {/* Status Text */}
              <div className="mb-8 h-12 text-center">
                {!isLive ? (
                  <p className="text-sm text-slate-400">Agent is currently offline.</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className={`flex items-center gap-2 text-lg font-semibold ${
                      agentState === 'speaking' ? 'text-blue-600' :
                      agentState === 'listening' ? 'text-emerald-600' : 'text-violet-600'
                    }`}>
                      {agentState === 'thinking' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {agentState === 'speaking' && <><Volume2 className="h-4 w-4" /> Speaking…</>}
                      {agentState === 'listening' && <><AudioLines className="h-4 w-4" /> Listening — speak now…</>}
                      {agentState === 'thinking' && "Thinking…"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {roundTripMs ? `Last round trip: ${roundTripMs}ms` : "Deepgram STT → Groq Llama 3.3 → Rumik Silk"}
                    </p>
                  </div>
                )}
                {micError && (
                  <p className="mt-2 max-w-xs rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                    {micError}
                  </p>
                )}
              </div>

              {/* Controls */}
              <button 
                onClick={isLive ? stopLive : startLive}
                className={`z-20 flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105 ${
                  !isLive 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {!isLive ? (
                  <><Play className="h-5 w-5 fill-current" /> Start Live Conversation</>
                ) : (
                  <><Phone className="h-5 w-5 fill-current" /> End Call</>
                )}
              </button>

              <p className="mt-4 max-w-xs text-center text-xs text-slate-400">
                Grants microphone access, then runs the full voice loop in your browser — speak, hear the agent reply in real time.
              </p>
            </div>

            {/* Live Transcript Log */}
            <div className="flex h-[520px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                  <MessageSquareText className="h-4 w-4 text-blue-600" /> Live Transcript
                </h3>
                {isLive && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {!isLive && conversation.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm italic text-slate-400">
                    Start a conversation — speak into your mic and the agent will reply out loud.
                  </div>
                )}
                {conversation.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'human' ? 'items-end' : 'items-start'}`}>
                    <span className="mb-1 ml-1 text-xs text-slate-400">{msg.role === 'human' ? 'You' : 'Vision 360 AI'}</span>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'human' 
                        ? 'rounded-br-none border border-slate-200 bg-slate-100 text-slate-700' 
                        : 'rounded-bl-none border border-blue-100 bg-blue-50 text-blue-900'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLive && agentState === 'thinking' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Agent is thinking…
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AGENT CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Agent Instructions (Prompt)</h3>
                <p className="text-sm text-slate-500">Define how the AI should behave, qualify leads, and close deals.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Agent System Prompt</label>
                <textarea 
                  className="h-64 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
                <p className="mt-2 text-xs text-slate-400">Runs on Groq Llama 3.3 70B Versatile for ultra-low latency logic processing.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Agent Voice Model</label>
                  <select
                    value={voiceModel}
                    onChange={(e) => setVoiceModel(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  >
                    {VOICE_OPTIONS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                  <p className="mt-2 text-xs text-slate-400">
                    {VOICE_OPTIONS.find(v => v.id === voiceModel)?.desc}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Agent Language</label>
                  <select
                    value={agentLang}
                    onChange={(e) => setAgentLang(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ml">Malayalam (മലയാളം)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                    <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="or">Odia (ଓଡ଼ିଆ)</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-400">
                    The agent greets in this language and automatically follows whichever language the caller speaks.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Greeting Style</label>
                  <select className="w-full appearance-none rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40">
                    <option>Greet first (e.g. "Hello, am I speaking with...")</option>
                    <option>Wait for user to speak</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="rounded-md bg-[#2563eb] px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
                  Save Agent Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: "Total Outbound Calls", value: "303", trend: "+12%", color: "text-blue-600" },
                { label: "Answer Rate", value: "72%", trend: "+5%", color: "text-emerald-600" },
                { label: "Converted Leads", value: "89", trend: "+18%", color: "text-amber-600" },
                { label: "AI Runtime Spend", value: "₹454.50", trend: "₹1.50/min", color: "text-rose-600" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <span className="text-xs text-slate-400">{kpi.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <h3 className="mb-6 text-lg font-medium text-slate-900">Call Volume (Last 7 Days)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                        itemStyle={{ color: '#0f172a' }}
                      />
                      <Area type="monotone" dataKey="calls" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCalls)" />
                      <Area type="monotone" dataKey="answered" stroke="#10b981" fillOpacity={1} fill="url(#colorAns)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <h3 className="mb-6 text-lg font-medium text-slate-900">Conversion Funnel</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                      />
                      <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TELEPHONY PROVIDERS & OUTBOUND DIALER */}
        {activeTab === 'telephony' && (
          <div className="space-y-8">
            {/* OUTBOUND DIALER */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Manual Outbound Dialer</h3>
                  <p className="text-sm text-slate-500">Fire a real PSTN call through Vobiz, or dispatch to the Dograh orchestrator.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Phone Number (E.164 Format)</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Carrier</label>
                  <select 
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value as 'vobiz' | 'dograh')}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  >
                    <option value="vobiz">Vobiz (Real PSTN)</option>
                    <option value="dograh">Dograh Orchestrator</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Campaign / Context</label>
                  <select className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40">
                    <option>Vision 360 AI - Sales Pitch (Default)</option>
                    <option>Customer Support - FAQ Bot</option>
                  </select>
                </div>
                <button 
                  onClick={initiateCall}
                  disabled={isDialing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  {isDialing ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneOutgoing className="h-5 w-5" />}
                  {isDialing ? "Dialing..." : "Initiate Call"}
                </button>
              </div>

              {callResult && (
                <div className={`mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                  callResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}>
                  {callResult.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{callResult.message}</span>
                </div>
              )}
            </div>

            {/* PROVIDERS GRID */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Live Provider Status</h3>
                <button
                  onClick={() => checkProviders(true)}
                  disabled={checkingProviders}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {checkingProviders ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Test Connections
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {providerCards.map((provider, i) => (
                  <div key={i} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                            {provider.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{provider.name}</h4>
                            <p className="text-xs text-slate-500">{provider.desc}</p>
                          </div>
                        </div>
                        {providerBadge(provider.key)}
                      </div>
                      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                        <span className="font-mono text-xs text-slate-500">{provider.env}</span>
                        <span className="text-xs text-slate-400">{providerStatus[provider.key]?.detail || '…'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Keys are stored server-side in <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">frontend/.env.local</code> — never exposed to the browser.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
