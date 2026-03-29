import { useEffect, useState } from 'react';
import { SendHorizonal, Trash2 } from 'lucide-react';
import { addChatMessage, clearChatMessages, getChatMessages, getLocalTutorResponse } from '../../lib/db';
import type { OfflineChatMessage } from '../../types';

const GREETING_TEXT = 'Hi, I am your offline tutor. Ask me any chapter question and I will help with quick explanations.';

type ChatMessage = OfflineChatMessage;

export function AiChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadMessages = async () => {
      const stored = await getChatMessages();

      if (!isActive) {
        return;
      }

      if (stored.length > 0) {
        setMessages(stored);
        setIsBootstrapping(false);
        return;
      }

      const greeting = await addChatMessage('assistant', GREETING_TEXT);
      if (!isActive) {
        return;
      }

      setMessages([greeting]);
      setIsBootstrapping(false);
    };

    void loadMessages();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking || isBootstrapping) {
      return;
    }

    setInput('');
    setIsThinking(true);

    void addChatMessage('user', trimmed).then((userMessage) => {
      setMessages((prev) => [...prev, userMessage]);

      window.setTimeout(() => {
        void getLocalTutorResponse(trimmed).then((response) => {
          void addChatMessage('assistant', response).then((assistantMessage) => {
            setMessages((prev) => [...prev, assistantMessage]);
            setIsThinking(false);
          });
        });
      }, 500);
    });
  };

  const handleClearChat = () => {
    if (isThinking || isBootstrapping) {
      return;
    }

    setIsBootstrapping(true);

    void clearChatMessages().then(async () => {
      const greeting = await addChatMessage('assistant', GREETING_TEXT);
      setMessages([greeting]);
      setIsBootstrapping(false);
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">Chat history is saved in IndexedDB and survives reloads.</p>
        <button
          type="button"
          onClick={handleClearChat}
          disabled={isThinking || isBootstrapping}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      <div className="max-h-[22rem] space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        {isBootstrapping ? <p className="text-xs text-slate-500 dark:text-slate-400">Loading chat history...</p> : null}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={[
                'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6',
                message.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              ].join(' ')}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isThinking ? <p className="text-xs text-slate-500 dark:text-slate-400">Tutor is typing...</p> : null}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question about any chapter..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isThinking || isBootstrapping || input.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendHorizonal size={16} />
          Send
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Responses are generated from your local IndexedDB study content. Later you can replace this with your RAG pipeline.
      </p>
    </section>
  );
}
