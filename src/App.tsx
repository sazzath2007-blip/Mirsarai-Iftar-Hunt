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
  Image as ImageIcon,
  MoonStar,
  Sparkles,
  Compass
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const globalFileInputRef = useRef<HTMLInputElement>(null);

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

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setPhotoPreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask || !userName || !photoPreview) return;
    setIsSubmitting(true);

    try {
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
        setUploadSuccess(true);
        setTimeout(() => {
          setIsUploading(false);
          setUploadSuccess(false);
          setSelectedTask(null);
          setPhotoPreview(null);
          setCaption('');
          fetchFeed();
          setActiveTab('feed');
          setIsSubmitting(false);
        }, 1500);
      } else {
        setIsSubmitting(false);
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsSubmitting(false);
      alert('An error occurred during upload.');
    }
  };

  const handleVote = async (id: number) => {
    const res = await fetch(`/api/vote/${id}`, { method: 'POST' });
    if (res.ok) {
      fetchFeed();
    }
  };

  const handlePlusClick = async () => {
    let currentTasks = tasks;
    if (currentTasks.length === 0) {
      try {
        const res = await fetch('/api/tasks');
        currentTasks = await res.json();
        setTasks(currentTasks);
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      }
    }
    
    const generalTask = currentTasks.find(t => t.title === 'General Discovery') || currentTasks[0];
    setSelectedTask(generalTask || { id: 999, title: 'General Discovery', description: 'Share your moment', points: 5 });
    globalFileInputRef.current?.click();
  };

  const handleTaskCameraClick = (task: Task) => {
    setSelectedTask(task);
    globalFileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* Hidden Global File Input */}
      <input 
        type="file"
        ref={globalFileInputRef}
        onChange={(e) => {
          handlePhotoSelect(e);
          setIsUploading(true);
          e.target.value = '';
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-primary text-warm-bg border-b border-accent/20 sticky top-0 z-30 px-6 py-6 shadow-xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center relative">
          <div className="absolute -top-4 -left-8 opacity-20 pointer-events-none">
            <MoonStar className="w-24 h-24 text-accent rotate-12" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold serif italic text-accent flex items-center gap-2">
              Mirsarai Iftar Hunt
              <Sparkles className="w-5 h-5 animate-pulse" />
            </h1>
            <p className="text-[10px] text-accent/70 uppercase tracking-[0.3em] font-bold">Ramadan Kareem • 1447 AH</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="hidden md:flex bg-accent/20 px-3 py-1 rounded-full items-center gap-1.5 border border-accent/30">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Leaderboard</span>
            </div>
            <button 
              onClick={handlePlusClick}
              className="bg-accent text-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/20 hover:scale-105 transition-transform flex items-center gap-2 border-2 border-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Discovery</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-10 mb-10 border-b border-primary/10 justify-center">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'tasks' ? 'text-primary' : 'text-primary/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              The Hunt
            </div>
            {activeTab === 'tasks' && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'feed' ? 'text-primary' : 'text-primary/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <MoonStar className="w-4 h-4" />
              Community
            </div>
            {activeTab === 'feed' && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
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
                    onClick={() => handleTaskCameraClick(task)}
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
                  className="aspect-video bg-primary/5 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent/30 transition-all overflow-hidden relative shadow-inner"
                >
                  {photoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                        <Camera className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-sm text-primary/60 font-bold serif italic">Snap your Ramadan moment</p>
                      <p className="text-[10px] text-primary/40 uppercase tracking-widest mt-1">Tap to open camera</p>
                    </>
                  )}
                  <input 
                    key={selectedTask?.id || 'none'}
                    type="file" 
                    onChange={handlePhotoSelect} 
                    accept="image/*" 
                    capture="environment"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  />
                </div>
                <p className="text-[10px] text-primary/40 text-center -mt-4">
                  Tip: Allow camera access to snap a photo directly.
                </p>

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
                  disabled={!photoPreview || !userName || isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                  ) : uploadSuccess ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Success!
                    </motion.div>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit to Feed
                    </>
                  )}
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
