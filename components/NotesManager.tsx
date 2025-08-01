import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '../types';

const NotesManager: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        try {
            const storedNotes = localStorage.getItem('acadmate-notes');
            if (storedNotes) {
                setNotes(JSON.parse(storedNotes));
            }
        } catch (error) {
            console.error("Failed to load notes from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('acadmate-notes', JSON.stringify(notes));
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    }, [notes]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Please provide both a title and content.");
            return;
        }

        if (editingNoteId) {
            setNotes(notes.map(note =>
                note.id === editingNoteId
                    ? { ...note, title, content, timestamp: new Date().toISOString() }
                    : note
            ));
        } else {
            const newNote: Note = {
                id: crypto.randomUUID(),
                title,
                content,
                timestamp: new Date().toISOString(),
            };
            setNotes([newNote, ...notes]);
        }
        
        setTitle('');
        setContent('');
        setEditingNoteId(null);
    };

    const handleEdit = (note: Note) => {
        setEditingNoteId(note.id);
        setTitle(note.title);
        setContent(note.content);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            setNotes(notes.filter(note => note.id !== id));
            if (id === editingNoteId) {
                setTitle('');
                setContent('');
                setEditingNoteId(null);
            }
        }
    };
    
    const handleCancelEdit = () => {
        setTitle('');
        setContent('');
        setEditingNoteId(null);
    };

    const filteredNotes = useMemo(() => {
        const sortedNotes = [...notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!searchTerm) return sortedNotes;
        return sortedNotes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <form onSubmit={handleFormSubmit} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-2xl shadow-sm space-y-4 sticky top-6">
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">{editingNoteId ? 'Edit Note' : 'Create Note'}</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                        required
                    />
                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg h-40 resize-none focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                        required
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-3 text-white font-semibold bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                            {editingNoteId ? 'Save Changes' : 'Add Note'}
                        </button>
                        {editingNoteId && (
                            <button type="button" onClick={handleCancelEdit} className="py-3 px-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-sm">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <div className="lg:col-span-2">
                <input
                    type="search"
                    placeholder="Search notes..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                />
                <ul className="space-y-4">
                    {filteredNotes.length > 0 ? filteredNotes.map(note => (
                        <li key={note.id} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-primary/50 border border-transparent">
                            <h3 className="font-bold text-xl mb-1 text-light-text dark:text-dark-text">{note.title}</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-3">
                                {new Date(note.timestamp).toLocaleString()}
                            </p>
                            <p className="whitespace-pre-wrap text-light-text dark:text-dark-text">{note.content}</p>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleEdit(note)} className="px-4 py-1 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(note.id)} className="px-4 py-1 text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </li>
                    )) : <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mt-8">No notes found. Create one to get started!</p>}
                </ul>
            </div>
        </div>
    );
};

export default NotesManager;