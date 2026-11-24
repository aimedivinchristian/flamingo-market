"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, Send, ArrowLeft, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Conv { id: string; otherName: string; otherImage: string | null; lastMessage: string | null; lastMessageAt: string; unread: number }
interface Msg { id: string; senderId: string; body: string; createdAt: string }
interface Thread { id: string; me: string; otherName: string; messages: Msg[] }

function timeLabel(d: string) {
  const dt = new Date(d), now = new Date();
  return dt.toDateString() === now.toDateString() ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : dt.toLocaleDateString([], { day: "numeric", month: "short" });
}

function MessagesInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params.get("c");
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [thread, setThread] = useState<Thread | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const loadList = useCallback(async () => {
    try { const r = await fetch("/api/chat/conversations"); const d = await r.json(); if (r.ok) setConvs(d); } finally { setLoadingList(false); }
  }, []);
  useEffect(() => { if (status !== "authenticated") return; loadList(); const t = setInterval(() => { if (!document.hidden) loadList(); }, 15_000); return () => clearInterval(t); }, [status, loadList]);

  const loadThread = useCallback(async (id: string) => {
    try { const r = await fetch(`/api/chat/conversations/${id}`); const d = await r.json(); if (r.ok) setThread(d); else if (r.status === 404) router.replace("/messages"); } catch { /* offline */ }
  }, [router]);
  useEffect(() => {
    setThread(null); lastCount.current = 0;
    if (!activeId || status !== "authenticated") return;
    loadThread(activeId);
    const t = setInterval(() => { if (!document.hidden) loadThread(activeId); }, 5_000);
    return () => clearInterval(t);
  }, [activeId, status, loadThread]);
  useEffect(() => { if (thread && thread.messages.length !== lastCount.current) { lastCount.current = thread.messages.length; bottomRef.current?.scrollIntoView({ behavior: "smooth" }); loadList(); } }, [thread, loadList]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/chat/conversations/${activeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "Could not send"); return; }
      setText("");
      setThread(t => t ? { ...t, messages: [...t.messages, d] } : t);
    } finally { setSending(false); }
  }

  if (!session) return null;
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-gray-50">
      <div className={cn(activeId && "hidden md:block")}><Navbar /></div>
      <div className="flex-1 min-h-0 max-w-[1100px] w-full mx-auto md:px-5 md:py-5 flex">
        <div className="flex-1 min-h-0 bg-white md:border border-gray-100 md:rounded-3xl overflow-hidden flex">
          {/* Conversation list */}
          <aside className={cn("w-full md:w-[340px] md:border-r border-gray-100 flex flex-col min-h-0", activeId && "hidden md:flex")}>
            <div className="px-5 py-4 border-b border-gray-100 font-extrabold text-gray-800 text-[16px]">Messages</div>
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
              {loadingList ? <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-pink" /></div>
                : convs.length === 0 ? <div className="text-center text-gray-400 text-[13px] px-8 py-16"><MessageCircle className="w-9 h-9 mx-auto mb-3 text-gray-200" />No conversations yet. Open a product and tap <b>Chat with seller</b>.</div>
                : convs.map(c => (
                  <button key={c.id} onClick={() => router.push(`/messages?c=${c.id}`)} className={cn("w-full text-left flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors", activeId === c.id && "bg-pink-pale")}>
                    <div className="w-11 h-11 rounded-full bg-gradient-pink text-white font-black flex items-center justify-center shrink-0 overflow-hidden">{c.otherImage ? <img src={c.otherImage} alt="" className="w-full h-full object-cover" /> : c.otherName[0]?.toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2"><span className="font-bold text-[14px] text-gray-800 truncate">{c.otherName}</span><span className="text-[11px] text-gray-300 shrink-0">{timeLabel(c.lastMessageAt)}</span></div>
                      <div className="flex justify-between gap-2"><span className={cn("text-[12.5px] truncate", c.unread ? "text-gray-800 font-semibold" : "text-gray-400")}>{c.lastMessage || "No messages yet"}</span>{c.unread > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-pink text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">{c.unread}</span>}</div>
                    </div>
                  </button>
                ))}
            </div>
          </aside>

          {/* Thread */}
          <section className={cn("flex-1 min-w-0 min-h-0 flex-col", activeId ? "flex" : "hidden md:flex")}>
            {!activeId ? <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Select a conversation</div> : (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => router.push("/messages")} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
                  <div className="font-extrabold text-gray-800 truncate">{thread?.otherName ?? "…"}</div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50/60">
                  {!thread ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pink" /></div>
                    : thread.messages.length === 0 ? <div className="text-center text-gray-400 text-[13px] py-10">Say hello 👋</div>
                    : thread.messages.map(m => {
                      const mine = m.senderId === thread.me;
                      return (
                        <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[80%] px-3.5 py-2 rounded-2xl text-[14px] whitespace-pre-wrap break-words", mine ? "bg-pink text-white rounded-br-md" : "bg-white border border-gray-100 text-gray-800 rounded-bl-md")}>
                            {m.body}<div className={cn("text-[10px] mt-1", mine ? "text-white/70" : "text-gray-300")}>{timeLabel(m.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2 bg-white" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
                  <input value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="Type a message…" className="flex-1 px-4 py-2.5 border-[1.5px] border-gray-200 rounded-full text-[14px] outline-none focus:border-pink" />
                  <button type="submit" disabled={sending || !text.trim()} className="w-11 h-11 rounded-full bg-gradient-pink text-white flex items-center justify-center shadow-pink disabled:opacity-50"><Send className="w-4 h-4" /></button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() { return <Suspense fallback={null}><MessagesInner /></Suspense>; }
