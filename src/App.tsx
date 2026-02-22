/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Heart, 
  Share2, 
  Plus, 
  X, 
  Check, 
  Trophy,
  Utensils,
  Sun,
  Moon,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Upload } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feed, setFeed] = useState<Upload[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'feed'>('tasks');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userName, setUserName] = useState('');
  const [caption, setCaption] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks();
    fetchFeed();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const fetchFeed = async () => {
    const res = await fetch('/api/feed');
    const data = await res.json();
    setFeed(data);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask || !userName || !photoPreview) return;

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: selectedTask.id,
        userName,
        photoData: photoPreview,
        caption
      }),
    });

    if (res.ok) {
      setIsUploading(false);
      setSelectedTask(null);
      setPhotoPreview(null);
      setCaption('');
      fetchFeed();
      setActiveTab('feed');
    }
  };

  const handleVote = async (id: number) => {
    const res = await fetch(`/api/vote/${id}`, { method: 'POST' });
    if (res.ok) {
      fetchFeed();
    }
  };

  const handlePlusClick = () => {
    const generalTask = tasks.find(t => t.title === 'General Discovery') || tasks[0];
    if (generalTask) {
      setSelectedTask(generalTask);
      setIsUploading(true);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold serif text-primary italic">Mirsarai Iftar Hunt</h1>
            <p className="text-xs text-primary/60 uppercase tracking-widest font-medium">Ramadan 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePlusClick}
              className="hidden md:flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Discovery
            </button>
            <div className="bg-primary/5 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">Leaderboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-primary/10">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === 'tasks' ? 'text-primary' : 'text-primary/40'
            }`}
          >
            Hunt Tasks
            {activeTab === 'tasks' && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === 'feed' ? 'text-primary' : 'text-primary/40'
            }`}
          >
            Community Feed
            {activeTab === 'feed' && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'tasks' ? (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-primary/5 flex justify-between items-start group hover:border-accent/30 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {task.points} pts
                      </span>
                      {task.title.includes('Jalebi') && <Utensils className="w-3.5 h-3.5 text-primary/40" />}
                      {task.title.includes('Sunset') && <Sun className="w-3.5 h-3.5 text-primary/40" />}
                      {task.title.includes('Mosque') && <Moon className="w-3.5 h-3.5 text-primary/40" />}
                    </div>
                    <h3 className="text-lg font-semibold serif mb-1">{task.title}</h3>
                    <p className="text-sm text-primary/60 leading-relaxed">{task.description}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsUploading(true);
                    }}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-accent transition-colors shadow-lg shadow-primary/20"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {feed.length === 0 ? (
                <div className="text-center py-20">
                  <ImageIcon className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-primary/40 serif italic">No photos yet. Be the first to hunt!</p>
                </div>
              ) : (
                feed.map((item) => (
                  <div key={item.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-primary/5">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold serif">
                          {item.user_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.user_name}</p>
                          <p className="text-[10px] text-primary/40 uppercase tracking-wider font-medium flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> {item.task_title}
                          </p>
                        </div>
                      </div>
                      <button className="text-primary/40 hover:text-primary">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="aspect-square bg-primary/5 relative">
                      <img 
                        src={item.photo_url} 
                        alt={item.caption} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => handleVote(item.id)}
                          className="flex items-center gap-2 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                            <Heart className={`w-5 h-5 ${item.votes > 0 ? 'fill-accent text-accent' : 'text-accent'}`} />
                          </div>
                          <span className="text-sm font-semibold text-primary">{item.votes} likes</span>
                        </button>
                        <span className="text-[10px] text-primary/40 uppercase font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {item.caption && (
                        <p className="text-sm text-primary/80 serif italic leading-relaxed">
                          "{item.caption}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-primary/5 flex justify-between items-center">
                <h2 className="text-xl font-semibold serif italic">Complete Hunt</h2>
                <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-primary/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2 block">Task</label>
                  <p className="text-lg font-semibold serif">{selectedTask?.title}</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video bg-primary/5 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent/30 transition-all overflow-hidden relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-primary/20 mb-2" />
                      <p className="text-xs text-primary/40 font-medium">Tap to take or upload photo</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2 block">Your Name</label>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Arif Hossain"
                      className="w-full px-4 py-3 bg-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mb-2 block">Caption (Optional)</label>
                    <textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Tell us about this spot..."
                      className="w-full px-4 py-3 bg-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm h-24 resize-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!photoPreview || !userName}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Submit to Feed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <button 
          onClick={handlePlusClick}
          className="w-14 h-14 rounded-full bg-accent text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
