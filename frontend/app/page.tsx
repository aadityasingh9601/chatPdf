"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { uploadData } from "./lib/actions/uploadData";
import { sendQuery } from "./lib/actions/sendQuery";
import { createClient } from "./lib/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.auth.getUserIdentities();
const userId = data?.identities[0].user_id;

interface Message {
  role: "user" | "assistant";
  content: string;
}

type PdfStatus = "idle" | "selected" | "uploading" | "ready";

export default function Home() {
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>("idle");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState([
    { id: "1", name: "research-paper.pdf" },
    { id: "2", name: "lecture-notes-ml.pdf" },
    { id: "3", name: "project-report.pdf" },
  ]);
  const [pdfToDelete, setPdfToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleFile = (file: File) => {
    if (file.type === "application/pdf") {
      setPdfFile(file);
      console.log(file.name);
      console.log(file);
      setPdfName(file.name);
      setPdfStatus("selected");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleConfirmUpload = async () => {
    setPdfStatus("uploading");
    // TODO: Replace with actual API call to backend to upload PDF
    // For now, simulate a backend call
    const res = await uploadData(userId, pdfFile);
    console.log(res);

    setPdfStatus("ready");
  };

  const handleCancelUpload = () => {
    setPdfFile(null);
    setPdfName("");
    setPdfStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with actual API call to backend
    // Example endpoint: POST /api/chat with { pdfName, question }
    const res = await sendQuery(pdfName, question);
    console.log(res);
    if (res.success) {
      const assistantMessage: Message = {
        role: "assistant",
        content: res.message.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
    else{
      setMessages((prev) => [...prev, {role:"assistant",content:"Something went wrong!"}])
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfName("");
    setMessages([]);
    setPdfStatus("idle");
  };

  const handleSelectPdf = (pdf: { id: string; name: string }) => {
    setPdfName(pdf.name);
    setPdfStatus("ready");
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement actual delete logic (call your delete handler)
    console.log("Delete PDF:", pdfToDelete);
    setUploadedPdfs((prev) => prev.filter((p) => p.id !== pdfToDelete?.id));
    setPdfToDelete(null);
  };

  // ─── Upload Screen ───
  if (pdfStatus === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm mb-4 shadow-lg shadow-indigo-500/20">
              <svg
                className="w-8 h-8 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white drop-shadow-sm">
              ChatPDF
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Upload a PDF to start asking questions
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
            className={`
              group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center
              transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-xl shadow-black/5
              ${
                isDragging
                  ? "upload-active border-indigo-400 bg-indigo-50/80"
                  : "border-zinc-200 hover:border-indigo-300 hover:bg-white"
              }
            `}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors mb-4">
              <svg
                className="w-6 h-6 text-zinc-400 group-hover:text-indigo-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-700">
              Drop your PDF here, or{" "}
              <span className="text-indigo-500">browse</span>
            </p>
            <p className="text-xs text-zinc-400 mt-2">Supports PDF files</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
    );
  }

  // ─── Confirm Selection ───
  if (pdfStatus === "selected") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 shrink-0">
                <svg
                  className="w-6 h-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {pdfName}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">PDF document</p>
              </div>
              <button
                onClick={handleCancelUpload}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancelUpload}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
              >
                Add PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Uploading Loader ───
  if (pdfStatus === "uploading") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 mb-4">
              <svg
                className="w-7 h-7 text-indigo-500 animate-spin-slow"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-900">Uploading PDF</p>
            <p className="text-xs text-zinc-400 mt-1">{pdfName}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat Screen ───
  return (
    <div className="flex flex-1 flex-col h-full relative">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-fade-in-fast"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-2xl z-50 flex flex-col animate-slide-in ${
          sidebarOpen ? "" : "-translate-x-full"
        } transition-transform duration-200 ease-out`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">Your PDFs</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PDF List */}
        <div className="flex-1 overflow-y-auto py-2">
          {uploadedPdfs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-zinc-400">No PDFs uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-0.5 px-2">
              {uploadedPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    pdfName === pdf.name
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                  onClick={() => handleSelectPdf(pdf)}
                >
                  <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="flex-1 text-sm truncate">{pdf.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfToDelete(pdf);
                    }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {pdfToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] animate-fade-in-fast">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPdfToDelete(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 text-center">Delete PDF</h4>
            <p className="text-xs text-zinc-500 text-center mt-1.5">
              Are you sure you want to delete <span className="font-medium text-zinc-700">{pdfToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPdfToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 shrink-0">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-zinc-900 truncate">
              {pdfName}
            </h2>
            <p className="text-xs text-zinc-400">Ready to answer questions</p>
          </div>
        </div>
        <button
          onClick={removePdf}
          className="text-xs text-zinc-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          New PDF
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center h-full min-h-[300px]">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm mb-3 shadow-sm">
                <svg
                  className="w-6 h-6 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/70">
                Ask anything about this document
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`animate-fade-in flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-md shadow-md shadow-indigo-500/20"
                      : "bg-white/90 backdrop-blur-sm text-zinc-700 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-white/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 bg-white rounded-2xl border border-zinc-200 focus-within:border-indigo-300 transition-colors px-4 py-2 shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your PDF..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 resize-none outline-none py-1.5 max-h-40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-white/50 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
