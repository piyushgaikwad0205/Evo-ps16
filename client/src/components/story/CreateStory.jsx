import React, { useState, useRef } from 'react';
import { createTextStory, createMediaStory } from '../../redux/api/storyAPI';
import { HiX, HiPhotograph, HiPencil, HiVideoCamera } from 'react-icons/hi';

const CreateStory = ({ onClose, onCreated }) => {
    const [mode, setMode] = useState('media'); // 'media' | 'text'
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [background, setBackground] = useState('#000000');
    const [privacy, setPrivacy] = useState('public');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (mode === 'text') {
                await createTextStory({ text, background, privacy });
            } else {
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('privacy', privacy);
                // Detect type roughly
                const type = file.type.startsWith('video') ? 'video' : 'image';
                formData.append('fileType', type);
                await createMediaStory(formData);
            }
            onCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create story", error);
            alert("Failed to create story");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"><HiX className="w-8 h-8" /></button>

            <div className="w-full max-w-md bg-white/90 dark:bg-black/90 border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-[80vh] shadow-2xl">
                <div className="flex border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/5">
                    <button
                        className={`flex-1 py-3 font-medium transition-colors ${mode === 'media' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                        onClick={() => setMode('media')}
                    >
                        Media
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium transition-colors ${mode === 'text' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                        onClick={() => setMode('text')}
                    >
                        Text
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-white/20 dark:bg-black/20 flex flex-col items-center justify-center">
                    {mode === 'media' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {file ? (
                                <div className="relative w-full h-full">
                                    {file.type.startsWith('video') ? (
                                        <video src={URL.createObjectURL(file)} controls className="w-full h-full object-contain rounded-lg" />
                                    ) : (
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                    )}
                                    <button onClick={() => setFile(null)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"><HiX className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="flex gap-4 justify-center mb-4">
                                        <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-2 p-6 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl shadow-lg hover:bg-white/80 dark:hover:bg-white/20 transition-all">
                                            <HiPhotograph className="w-10 h-10 text-green-500" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Photo</span>
                                        </button>
                                        <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-2 p-6 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl shadow-lg hover:bg-white/80 dark:hover:bg-white/20 transition-all">
                                            <HiVideoCamera className="w-10 h-10 text-red-500" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Video</span>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                    />
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Max video length: 15s</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center p-8 text-center rounded-lg"
                            style={{ backgroundColor: background }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type something..."
                                className="w-full bg-transparent text-white text-center text-2xl font-bold outline-none resize-none placeholder-white/50"
                                rows={5}
                            />
                        </div>
                    )}
                </div>

                {mode === 'text' && (
                    <div className="p-3 flex gap-2 justify-center bg-white/40 dark:bg-white/5 border-t border-white/20 dark:border-white/10">
                        {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map(c => (
                            <button
                                key={c}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${background === c ? 'border-white ring-2 ring-blue-500 scale-110' : 'border-white/30 hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setBackground(c)}
                            />
                        ))}
                    </div>
                )}

                <div className="p-4 bg-white/40 dark:bg-white/5 border-t border-white/20 dark:border-white/10">
                    <div className="mb-4">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase mb-2 block">Privacy</label>
                        <select
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value)}
                            className="w-full p-3 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="public">Public</option>
                            <option value="followers">Followers Only</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || (mode === 'text' && !text) || (mode === 'media' && !file)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        {loading ? 'Posting...' : 'Share Story'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
