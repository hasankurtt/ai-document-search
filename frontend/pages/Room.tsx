import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi, docApi, chatApi, getErrorMessage } from '../services/api';
import { Room as RoomType, DocumentFile, Message } from '../types';
import { MAX_DOCS_PER_ROOM, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, POLL_INTERVAL_MS } from '../constants';
import { Button, Input, PageSpinner, Badge } from '../components/UI';
import { Send, UploadCloud, File, Trash2, ArrowLeft, Bot, User as UserIcon, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Room: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<RoomType | null>(null);
  const [docs, setDocs] = useState<DocumentFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [docError, setDocError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Initial Data Fetch ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [roomRes, docsRes, historyRes] = await Promise.all([
          roomApi.getOne(id),
          docApi.list(id),
          chatApi.getHistory(id)
        ]);
        setRoom(roomRes.data);
        setDocs(docsRes.data);
        setMessages(historyRes.data);
      } catch (err) {
        setError("Failed to load room data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Polling for Doc Status ---
  useEffect(() => {
    if (!id) return;
    
    // Only poll if there are unprocessed docs
    const hasUnprocessed = docs.some(d => !d.processed);
    if (!hasUnprocessed) return;

    const interval = setInterval(async () => {
      try {
        const res = await docApi.list(id);
        setDocs(res.data);
      } catch (e) {
        console.error("Polling failed", e);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [id, docs]);

  // --- Scroll to bottom on new message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    
    setDocError('');
    
    // Client-side validations
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setDocError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    const isPdfOrTxt = file.type === 'application/pdf' || file.type === 'text/plain';
    if (!isPdfOrTxt) {
      setDocError("Only PDF and TXT files are allowed.");
      return;
    }
    if (docs.length >= MAX_DOCS_PER_ROOM) {
      setDocError(`Maximum ${MAX_DOCS_PER_ROOM} documents allowed.`);
      return;
    }

    setUploading(true);
    try {
      await docApi.upload(id, file);
      // Refresh list immediately
      const res = await docApi.list(id);
      setDocs(res.data);
    } catch (err) {
      setDocError(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Remove this document?")) return;
    try {
      await docApi.delete(docId);
      setDocs(docs.filter(d => d.id !== docId));
    } catch (err) {
      setDocError(getErrorMessage(err));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !id) return;

    const tempMsg: Message = {
      message_type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setQuestion('');
    setChatLoading(true);

    try {
      const res = await chatApi.sendMessage(id, tempMsg.content);
      const aiMsg: Message = {
        message_type: 'ai',
        content: res.data.answer,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        message_type: 'ai',
        content: `Error: ${getErrorMessage(err)}`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!room) return <div className="text-center p-10 text-red-500">Room not found</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* --- Sidebar (Room Info & Docs) --- */}
      <aside className="w-80 bg-[#0e0e14] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{room.emoji}</span>
            <h1 className="text-xl font-bold text-white truncate">{room.name}</h1>
          </div>
          <p className="text-sm text-gray-400">{room.description}</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Documents</h2>
            <span className="text-xs text-gray-500">{docs.length}/{MAX_DOCS_PER_ROOM}</span>
          </div>

          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="group p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200 truncate">{doc.filename}</span>
                  </div>
                  <button onClick={() => handleDeleteDoc(doc.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  {doc.processed ? (
                    <Badge variant="success">Processed</Badge>
                  ) : (
                    <Badge variant="warning">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {docs.length === 0 && (
              <div className="text-center py-6 border border-dashed border-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">No documents yet</p>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="mt-6">
            <label className={`block w-full p-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer text-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-300 font-medium">Upload PDF/TXT</span>
              <span className="block text-xs text-gray-500 mt-1">Max {MAX_FILE_SIZE_MB}MB</span>
            </label>
            {docError && <p className="text-xs text-red-400 mt-2 text-center">{docError}</p>}
          </div>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <main className="flex-1 flex flex-col bg-background relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between">
             <button onClick={() => navigate('/dashboard')}><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
             <span className="font-bold">{room.name}</span>
             <span className="w-5"></span> {/* Spacer */}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
               <Bot className="w-16 h-16 mb-4" />
               <p>Ask a question about your documents to start.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-3xl mx-auto ${msg.message_type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.message_type === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  {msg.message_type === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                
                <div className={`flex flex-col max-w-[85%] ${msg.message_type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3.5 rounded-2xl ${
                    msg.message_type === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[#1e1e2d] border border-white/5 text-gray-200 rounded-tl-none'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Sources Display */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sources:</span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-blue-300 border border-white/5 flex items-center">
                          <File className="w-3 h-3 mr-1" />
                          {src.filename} {src.page ? `(p. ${src.page})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
               <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
               <div className="px-5 py-3.5 rounded-2xl bg-[#1e1e2d] border border-white/5 rounded-tl-none flex items-center gap-2">
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-background/80 backdrop-blur-md border-t border-white/5">
          <div className="max-w-3xl mx-auto">
             <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={docs.length === 0 ? "Upload a document to start chatting..." : "Ask a question about your documents..."}
                  disabled={docs.length === 0 || chatLoading}
                  className="w-full bg-[#16161f] border border-white/10 rounded-xl pl-5 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                />
                <button 
                  type="submit" 
                  disabled={!question.trim() || chatLoading || docs.length === 0}
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
             </form>
             <p className="text-center text-xs text-gray-600 mt-2">
               AI can make mistakes. Verify information from the source documents.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};