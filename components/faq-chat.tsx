"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FAQS, STARTER_QUESTIONS, matchFaqs, type Faq, type FaqLink } from "@/lib/faq";

type Message =
  | { id: number; from: "guest"; text: string }
  | { id: number; from: "bot"; text: string; links?: FaqLink[]; suggestions?: Faq[]; contact?: boolean };

const byId = (id: string) => FAQS.find((f) => f.id === id)!;

// Greetings and thanks on their own (not "hi, can I pay by card?").
const SMALL_TALK = /^\s*(hi|hey|hello|hallo|good (morning|afternoon|evening)|thanks?( you)?|thank you|ok(ay)?|cool)[\s!.,]*$/i;

/**
 * FAQ chat bubble (bottom right). Answers come only from lib/faq.ts, matched
 * in the browser: nothing typed here is sent anywhere.
 */
export function FaqChat({ contactEmail }: { contactEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0,
      from: "bot",
      text: "Hello! I can answer common questions about booking, payment and the hotel. Ask me anything, or pick a question below.",
      suggestions: STARTER_QUESTIONS.map(byId),
    },
  ]);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function ask(question: string, chosen?: Faq) {
    const text = question.trim();
    if (!text) return;
    const guest: Message = { id: nextId.current++, from: "guest", text };
    let reply: Message;
    const matches = chosen ? [{ faq: chosen, score: 99 }] : matchFaqs(text);
    if (!chosen && SMALL_TALK.test(text)) {
      reply = {
        id: nextId.current++,
        from: "bot",
        text: /thank/i.test(text)
          ? "You're welcome! Anything else I can help with?"
          : "Hello! What would you like to know? Here are some popular questions.",
        suggestions: STARTER_QUESTIONS.map(byId),
      };
    } else if (matches.length > 0) {
      const [best, ...rest] = matches;
      reply = {
        id: nextId.current++,
        from: "bot",
        text: best.faq.answer,
        links: best.faq.links,
        // Close runners-up as "you may also mean…"
        suggestions: rest.filter((m) => m.score >= best.score * 0.6).map((m) => m.faq),
        contact: /contact the hotel/i.test(best.faq.answer),
      };
    } else {
      reply = {
        id: nextId.current++,
        from: "bot",
        text: "Sorry, I don't have an answer for that yet. Here are some things I can help with, or you can contact the hotel directly.",
        suggestions: STARTER_QUESTIONS.map(byId),
        contact: true,
      };
    }
    setMessages((m) => [...m, guest, reply]);
    setDraft("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(draft);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Questions about Royal Kamak"
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col border border-line bg-white shadow-[0_30px_60px_-20px_rgba(60,40,20,.35)] sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-4">
            <div>
              <p className="eyebrow">Royal Kamak</p>
              <p className="display mt-1 text-xl">How can we help?</p>
            </div>
            <button type="button" onClick={close} aria-label="Close chat" className="p-2 text-xl leading-none hover:text-brand">
              ×
            </button>
          </div>

          <ol ref={listRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((m) =>
              m.from === "guest" ? (
                <li key={m.id} className="ml-10 flex justify-end">
                  <p className="bg-brand px-4 py-2.5 text-sm text-brand-foreground [overflow-wrap:anywhere]">{m.text}</p>
                </li>
              ) : (
                <li key={m.id} className="mr-6 space-y-3">
                  <p className="border border-line bg-ink/50 px-4 py-3 text-sm leading-relaxed">{m.text}</p>
                  {m.links && m.links.length > 0 && (
                    <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
                      {m.links.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="link-arrow text-brand">
                          {link.label} <span aria-hidden>→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.contact && (
                    <p className="px-1 text-xs text-muted">
                      {contactEmail ? (
                        <>
                          Email the hotel:{" "}
                          <a href={`mailto:${contactEmail}`} className="text-brand underline-offset-4 hover:underline">
                            {contactEmail}
                          </a>
                        </>
                      ) : (
                        "Our reception team will be happy to help."
                      )}
                    </p>
                  )}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.suggestions.map((faq) => (
                        <button
                          key={faq.id}
                          type="button"
                          onClick={() => ask(faq.question, faq)}
                          className="border border-line px-3 py-1.5 text-left text-xs transition hover:border-brand hover:text-brand"
                        >
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ),
            )}
          </ol>

          <form onSubmit={onSubmit} className="flex border-t border-line">
            <label htmlFor={`${panelId}-q`} className="sr-only">
              Your question
            </label>
            <input
              id={`${panelId}-q`}
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
              autoComplete="off"
              placeholder="Type your question…"
              className="min-w-0 flex-1 px-4 py-3.5 text-sm outline-none"
            />
            <button type="submit" disabled={!draft.trim()} className="btn px-4 py-3.5 disabled:opacity-40">
              Ask
            </button>
          </form>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close questions" : "Questions? Chat with us"}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex h-14 items-center gap-3 rounded-full bg-brand px-5 text-brand-foreground shadow-[0_14px_30px_-10px_rgba(132,0,0,.6)] transition hover:bg-brand-hover"
      >
        {open ? (
          <span aria-hidden className="text-2xl leading-none">
            ×
          </span>
        ) : (
          <>
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 5h16v11H9l-5 4V5z" strokeLinejoin="round" />
            </svg>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] sm:inline">Questions?</span>
          </>
        )}
      </button>
    </div>
  );
}
