import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi, getErrorMessage } from '../services/api';
import { Room } from '../types';
import { MAX_ROOMS, EMOJI_LIST } from '../constants';
import { Button, Card, Input, Modal, PageSpinner } from '../components/UI';
import { Plus, Trash2, MessageSquare, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomEmoji, setNewRoomEmoji] = useState(EMOJI_LIST[0]);
  const [isCreating, setIsCreating] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll();
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rooms.length >= MAX_ROOMS) {
      setCreateError(`Maximum ${MAX_ROOMS} rooms allowed.`);
      return;
    }
    
    setIsCreating(true);
    setCreateError('');
    
    try {
      await roomApi.create({
        name: newRoomName,
        description: newRoomDesc,
        emoji: newRoomEmoji
      });
      setIsModalOpen(false);
      // Reset form
      setNewRoomName('');
      setNewRoomDesc('');
      setNewRoomEmoji(EMOJI_LIST[0]);
      fetchRooms();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRoom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

    try {
      await roomApi.delete(id);
      fetchRooms();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setTimeout(() => setDeleteError(''), 3000);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
          <p className="text-gray-400">Manage your knowledge rooms.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="secondary" onClick={logout} icon={LogOut}>Logout</Button>
           <Button onClick={() => setIsModalOpen(true)} icon={Plus}>New Room</Button>
        </div>
      </header>

      {deleteError && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {deleteError}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card 
            key={room.id} 
            onClick={() => navigate(`/room/${room.id}`)}
            className="group relative hover:bg-[#1c1c26] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl">{room.emoji}</span>
              <button 
                onClick={(e) => handleDeleteRoom(e, room.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
            <p className="text-gray-400 text-sm mb-6 h-10 line-clamp-2">{room.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{room.document_count} Docs</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{room.message_count} msgs</span>
              </div>
            </div>
          </Card>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-white/5">
            <p className="text-gray-400 mb-4">No rooms created yet.</p>
            <Button onClick={() => setIsModalOpen(true)}>Create your first room</Button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Room">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewRoomEmoji(emoji)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-colors ${newRoomEmoji === emoji ? 'bg-blue-600/20 border border-blue-500' : 'bg-[#111118] hover:bg-white/5'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <Input 
            label="Room Name" 
            placeholder="e.g., Marketing Q4" 
            value={newRoomName} 
            onChange={e => setNewRoomName(e.target.value)} 
            required 
          />
          
          <Input 
            label="Description" 
            placeholder="What's this room for?" 
            value={newRoomDesc} 
            onChange={e => setNewRoomDesc(e.target.value)} 
            required 
          />

          {createError && (
             <p className="text-sm text-red-400">{createError}</p>
          )}
          
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isCreating}>Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};