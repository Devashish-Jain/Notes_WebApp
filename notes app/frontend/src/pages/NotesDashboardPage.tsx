import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SimpleImageViewer from '../components/SimpleImageViewer';
import RichTextEditor from '../components/RichTextEditor';
import NoteContentRenderer from '../components/NoteContentRenderer';

interface Note {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    imageUrls: string[];
}

interface ShareLink {
    id: number;
    shareId: string;
    accessLevel: 'VIEWER' | 'EDITOR';
    createdAt: string;
}

const NotesDashboardPage: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editNote, setEditNote] = useState({ title: '', content: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharingNote, setSharingNote] = useState<Note | null>(null);
    const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
    const [selectedAccessLevel, setSelectedAccessLevel] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
    const [isCreatingShare, setIsCreatingShare] = useState(false);
    const [loadingShares, setLoadingShares] = useState(false);
    
    // Delete Share Link State
    const [showDeleteShareModal, setShowDeleteShareModal] = useState(false);
    const [deletingShareLink, setDeletingShareLink] = useState<ShareLink | null>(null);
    const [isDeletingShare, setIsDeletingShare] = useState(false);
    
    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingNote, setDeletingNote] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Success Message State
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Image Viewer State
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImages, setViewerImages] = useState<string[]>([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
    
    // Image Management State
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    
    // Feedback Modal State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState<any>(null);
    const [feedbackHasSubmitted, setFeedbackHasSubmitted] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNotes(response.data);
            setError(null);
        } catch (error: any) {
            console.error('Failed to fetch notes:', error);
            setError('Failed to load notes. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const createNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim()) {
            setError('Please fill in both title and content');
            return;
        }

        try {
            setIsCreating(true);
            setError(null);
            
            const formData = new FormData();
            formData.append('title', newNote.title);
            formData.append('content', newNote.content);
            
            // Add selected files
            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });

            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Reset form and close modal
            setNewNote({ title: '', content: '' });
            setSelectedFiles([]);
            setShowAddModal(false);
            
            // Refresh notes list
            await fetchNotes();
            
        } catch (error: any) {
            console.error('Failed to create note:', error);
            setError('Failed to create note. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Filter for image files only
            const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
            
            // Accumulate files instead of replacing them
            setSelectedFiles(prev => {
                const combined = [...prev, ...imageFiles];
                // Remove duplicates based on file name and size
                const unique = combined.filter((file, index, arr) => 
                    arr.findIndex(f => f.name === file.name && f.size === file.size) === index
                );
                console.log('[Dashboard] Files selected:', {
                    previousCount: prev.length,
                    newCount: imageFiles.length,
                    totalCount: unique.length,
                    fileNames: unique.map(f => f.name)
                });
                return unique;
            });
            
            // Clear the input value to allow selecting the same file again if removed
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    // Show success message temporarily
    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };
    
    // Task Toggle in View Mode
    const handleTaskToggle = async (noteId: number, updatedContent: string) => {
        try {
            const noteToUpdate = notes.find(n => n.id === noteId);
            if (!noteToUpdate) return;

            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteId}`,
                {
                    title: noteToUpdate.title,
                    content: updatedContent
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Update the local state immediately without full refresh
            setNotes(prevNotes => 
                prevNotes.map(note => 
                    note.id === noteId ? { ...note, content: updatedContent } : note
                )
            );
            
        } catch (error: any) {
            console.error('Failed to update task:', error);
            setError('Failed to update task. Please try again.');
            throw error; // Re-throw to trigger error handling in NoteContentRenderer
        }
    };
    
    // Edit Note Functions
    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setEditNote({ title: note.title, content: note.content });
        setShowEditModal(true);
        setError(null);
    };
    
    const updateNote = async () => {
        if (!editingNote || !editNote.title.trim() || !editNote.content.trim()) {
            setError('Please fill in both title and content');
            return;
        }
        
        try {
            setIsUpdating(true);
            setError(null);
            
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${editingNote.id}`,
                {
                    title: editNote.title,
                    content: editNote.content
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Close modal and refresh
            setShowEditModal(false);
            setEditingNote(null);
            setEditNote({ title: '', content: '' });
            await fetchNotes();
            showSuccess('Note updated successfully!');
            
        } catch (error: any) {
            console.error('Failed to update note:', error);
            setError('Failed to update note. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Share Note Functions
    const openShareModal = async (note: Note) => {
        setSharingNote(note);
        setShowShareModal(true);
        setSelectedAccessLevel('VIEWER');
        setError(null);
        await fetchShareLinks(note.id);
    };
    
    const fetchShareLinks = async (noteId: number) => {
        try {
            setLoadingShares(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteId}/shares`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setShareLinks(response.data);
        } catch (error: any) {
            console.error('Failed to fetch share links:', error);
            setError('Failed to load share links.');
        } finally {
            setLoadingShares(false);
        }
    };
    
    const createShareLink = async () => {
        if (!sharingNote) return;
        
        try {
            setIsCreatingShare(true);
            setError(null);
            
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${sharingNote.id}/share`,
                {
                    accessLevel: selectedAccessLevel
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Refresh share links
            await fetchShareLinks(sharingNote.id);
            showSuccess(`Share link created with ${selectedAccessLevel.toLowerCase()} access!`);
            
        } catch (error: any) {
            console.error('Failed to create share link:', error);
            setError('Failed to create share link. Please try again.');
        } finally {
            setIsCreatingShare(false);
        }
    };
    
    const copyShareLink = (shareId: string) => {
        const fullUrl = `${window.location.origin}/shared/${shareId}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            showSuccess('Share link copied to clipboard!');
        }).catch(() => {
            setError('Failed to copy link to clipboard.');
        });
    };
    
    // Delete Share Link Functions
    const openDeleteShareModal = (shareLink: ShareLink) => {
        setDeletingShareLink(shareLink);
        setShowDeleteShareModal(true);
        setError(null);
    };
    
    const deleteShareLink = async () => {
        if (!deletingShareLink) return;
        
        try {
            setIsDeletingShare(true);
            setError(null);
            
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/shares/${deletingShareLink.shareId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            // Close modal and refresh share links
            setShowDeleteShareModal(false);
            setDeletingShareLink(null);
            
            if (sharingNote) {
                await fetchShareLinks(sharingNote.id);
            }
            
            showSuccess('Share link deleted successfully!');
            
        } catch (error: any) {
            console.error('Failed to delete share link:', error);
            setError('Failed to delete share link. Please try again.');
        } finally {
            setIsDeletingShare(false);
        }
    };
    
    // Delete Note Functions
    const openDeleteModal = (note: Note) => {
        setDeletingNote(note);
        setShowDeleteModal(true);
        setError(null);
    };
    
    const deleteNote = async () => {
        if (!deletingNote) return;
        
        try {
            setIsDeleting(true);
            setError(null);
            
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${deletingNote.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            // Close modal and refresh
            setShowDeleteModal(false);
            setDeletingNote(null);
            await fetchNotes();
            showSuccess('Note deleted successfully!');
            
        } catch (error: any) {
            console.error('Failed to delete note:', error);
            setError('Failed to delete note. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    // Image Viewing Functions
    const openImageViewer = (images: string[], initialIndex: number = 0) => {
        console.log('[Dashboard] Opening image viewer:', { images, initialIndex });
        setViewerImages([...images]);
        setViewerInitialIndex(initialIndex);
        setShowImageViewer(true);
    };
    
    const closeImageViewer = () => {
        console.log('[Dashboard] Closing image viewer');
        setShowImageViewer(false);
        setViewerImages([]);
        setViewerInitialIndex(0);
    };
    
    // Image Management Functions
    const handleAddImages = async (noteId: number, files: FileList | null) => {
        console.log('[Dashboard] Adding images:', { noteId, filesCount: files?.length });
        if (!files || files.length === 0) {
            console.log('[Dashboard] No files selected, returning');
            return;
        }
        
        try {
            setIsUploadingImages(true);
            
            const formData = new FormData();
            Array.from(files).forEach((file, index) => {
                console.log('[Dashboard] Adding file to FormData:', { index, fileName: file.name, fileType: file.type });
                if (file.type.startsWith('image/')) {
                    formData.append('images', file);
                }
            });
            
            console.log('[Dashboard] Sending request to add images');
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteId}/images`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('[Dashboard] Images added successfully:', response.data);
            // Refresh the notes
            await fetchNotes();
            showSuccess('Images added successfully!');
            
        } catch (error: any) {
            console.error('[Dashboard] Failed to add images:', error);
            setError('Failed to add images. Please try again.');
        } finally {
            setIsUploadingImages(false);
        }
    };
    
    const handleDeleteImage = async (imageUrl: string) => {
        console.log('[Dashboard] Deleting image:', { imageUrl: imageUrl.substring(0, 50) + '...' });
        
        // Find which note this image belongs to
        const noteWithImage = notes.find(note => 
            note.imageUrls && note.imageUrls.includes(imageUrl)
        );
        
        console.log('[Dashboard] Found note with image:', { noteId: noteWithImage?.id, noteTitle: noteWithImage?.title });
        
        if (!noteWithImage) {
            console.error('[Dashboard] Could not find note containing this image');
            setError('Could not find the note containing this image.');
            return;
        }
        
        try {
            console.log('[Dashboard] Sending delete request');
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteWithImage.id}/images`,
                {
                    data: { imageUrl },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('[Dashboard] Image deleted successfully');
            // Refresh the notes
            await fetchNotes();
            showSuccess('Image deleted successfully!');
            
        } catch (error: any) {
            console.error('[Dashboard] Failed to delete image:', error);
            setError('Failed to delete image. Please try again.');
        }
    };
    
    // Feedback Functions
    const checkFeedbackStatus = async () => {
        try {
            console.log('[Dashboard] Checking feedback status');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/feedback/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('[Dashboard] Feedback status:', response.data);
            setFeedbackHasSubmitted(response.data.hasSubmitted);
            if (response.data.feedback) {
                setExistingFeedback(response.data.feedback);
                setFeedbackRating(response.data.feedback.rating);
                setFeedbackMessage(response.data.feedback.message || '');
            }
        } catch (error) {
            console.error('[Dashboard] Failed to check feedback status:', error);
        }
    };
    
    const submitFeedback = async () => {
        if (feedbackRating === 0) {
            setError('Please select a rating before submitting.');
            return;
        }
        
        try {
            setFeedbackSubmitting(true);
            setError(null);
            
            console.log('[Dashboard] Submitting feedback:', { rating: feedbackRating, message: feedbackMessage });
            
            const url = feedbackHasSubmitted ? '/api/feedback/update' : '/api/feedback/submit';
            const method = feedbackHasSubmitted ? 'put' : 'post';
            
            const response = await axios[method](
                `${import.meta.env.VITE_API_BASE_URL}${url}`,
                {
                    rating: feedbackRating,
                    message: feedbackMessage
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('[Dashboard] Feedback submitted successfully:', response.data);
            showSuccess(feedbackHasSubmitted ? 'Feedback updated successfully!' : 'Thank you for your feedback!');
            setShowFeedbackModal(false);
            
            // Reset form
            setFeedbackRating(0);
            setFeedbackMessage('');
            
        } catch (error: any) {
            console.error('[Dashboard] Failed to submit feedback:', error);
            setError(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
                <div className="container">
                    <div className="loading">Loading your notes...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '24px' 
                }}>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '700', 
                        margin: '0'
                    }}>
                        Your Notes
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            onClick={() => {
                                console.log('[Dashboard] Opening feedback modal');
                                setShowFeedbackModal(true);
                                checkFeedbackStatus();
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                                (e.target as HTMLElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.transform = 'translateY(0)';
                                (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                            title="Rate your experience with NotesApp"
                        >
                            📊 Rate Us
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary"
                            style={{ 
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            + Add Note
                        </button>
                    </div>
                </div>
                
                {error && (
                    <div style={{
                        background: '#fed7d7',
                        color: '#c53030',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                {successMessage && (
                    <div style={{
                        background: '#c6f6d5',
                        color: '#22543d',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        {successMessage}
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                    marginTop: '32px'
                }}>
                    {notes.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '64px 0',
                            color: 'var(--text-secondary)'
                        }}>
                            <h3>No notes found</h3>
                            <p>Create your first note to get started!</p>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary"
                                style={{ marginTop: '16px' }}
                            >
                                + Create Your First Note
                            </button>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="note-card" style={{ position: 'relative' }}>
                                <div className="note-card-header">
                                    <h3 className="note-card-title">{note.title}</h3>
                                    <div className="note-card-date">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="note-card-content">
                                    <NoteContentRenderer 
                                        content={note.content}
                                        editable={false}
                                        onTaskToggle={(updatedContent) => handleTaskToggle(note.id, updatedContent)}
                                    />
                                </div>
                                
                                {/* Images Section */}
                                {note.imageUrls && note.imageUrls.length > 0 ? (
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '16px',
                                            marginBottom: '12px'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                margin: 0,
                                                color: 'var(--text-primary)'
                                            }}>
                                                Images ({note.imageUrls.length})
                                            </h4>
                                            
                                            {/* Add Images Button */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleAddImages(note.id, e.target.files)}
                                                    style={{ display: 'none' }}
                                                    id={`add-images-${note.id}`}
                                                />
                                                <label
                                                    htmlFor={`add-images-${note.id}`}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #48bb78, #38a169)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        cursor: isUploadingImages ? 'not-allowed' : 'pointer',
                                                        opacity: isUploadingImages ? 0.7 : 1,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {isUploadingImages ? 'Adding...' : '+ Add'}
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: '8px'
                                        }}>
                                            {note.imageUrls.slice(0, 5).map((imageUrl, index) => {
                                                console.log('[Dashboard] Rendering image:', { noteId: note.id, index, imageUrl: imageUrl.substring(0, 50) + '...' });
                                                return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        borderRadius: '6px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    className="image-container"
                                                    onClick={() => {
                                                        console.log('[Dashboard] Image container clicked!', {
                                                            noteId: note.id,
                                                            index,
                                                            imageUrl: imageUrl.substring(0, 50) + '...'
                                                        });
                                                        openImageViewer(note.imageUrls, index);
                                                    }}
                                                    onMouseEnter={() => {
                                                        console.log('[Dashboard] Mouse enter on image container', { noteId: note.id, index });
                                                    }}
                                                    onMouseLeave={() => {
                                                        console.log('[Dashboard] Mouse leave on image container', { noteId: note.id, index });
                                                    }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Note attachment ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100px',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                        onError={(e) => {
                                                            console.log('[Dashboard] Image load error:', imageUrl);
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('[Dashboard] Image loaded successfully:', { noteId: note.id, index });
                                                        }}
                                                        onClick={(e) => {
                                                            console.log('[Dashboard] Direct image click!', { noteId: note.id, index, event: e });
                                                            e.stopPropagation();
                                                            openImageViewer(note.imageUrls, index);
                                                        }}
                                                    />
                                                    
                                                    {/* Hover Eye Icon */}
                                                    <div 
                                                        className="image-overlay"
                                                        onClick={(e) => {
                                                            console.log('[Dashboard] Overlay clicked!', { noteId: note.id, index, event: e });
                                                            e.stopPropagation();
                                                            openImageViewer(note.imageUrls, index);
                                                        }}
                                                        onMouseEnter={() => {
                                                            console.log('[Dashboard] Overlay mouse enter', { noteId: note.id, index });
                                                        }}
                                                    >
                                                        <div 
                                                            className="eye-icon"
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                fontSize: '18px'
                                                            }}
                                                        >
                                                            👁️
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteImage(imageUrl);
                                                        }}
                                                        className="image-delete-btn"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            background: 'rgba(220, 38, 38, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '24px',
                                                            height: '24px',
                                                            color: 'white',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 10
                                                        }}
                                                        title="Delete Image"
                                                    >
                                                        ×
                                                    </button>
                                                    
                                                    {/* Image Number Badge */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '2px',
                                                        right: '2px',
                                                        background: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            );
                                            })}
                                            
                                            {/* +X More Images Container */}
                                            {note.imageUrls.length > 5 && (
                                                <div
                                                    style={{
                                                        borderRadius: '6px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                        background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        minHeight: '100px'
                                                    }}
                                                    className="image-container"
                                                    onClick={() => {
                                                        console.log('[Dashboard] +More container clicked!', {
                                                            noteId: note.id,
                                                            totalImages: note.imageUrls.length,
                                                            hiddenImages: note.imageUrls.length - 5
                                                        });
                                                        openImageViewer(note.imageUrls, 5);
                                                    }}
                                                    onMouseEnter={() => {
                                                        console.log('[Dashboard] Mouse enter on +More container', { noteId: note.id });
                                                    }}
                                                    onMouseLeave={() => {
                                                        console.log('[Dashboard] Mouse leave on +More container', { noteId: note.id });
                                                    }}
                                                >
                                                    <div style={{
                                                        textAlign: 'center',
                                                        fontSize: '24px',
                                                        fontWeight: '700'
                                                    }}>
                                                        +{note.imageUrls.length - 5}
                                                    </div>
                                                    
                                                    {/* Hover Eye Icon */}
                                                    <div 
                                                        className="image-overlay"
                                                        onClick={(e) => {
                                                            console.log('[Dashboard] +More overlay clicked!', { noteId: note.id, event: e });
                                                            e.stopPropagation();
                                                            openImageViewer(note.imageUrls, 5);
                                                        }}
                                                        onMouseEnter={() => {
                                                            console.log('[Dashboard] +More overlay mouse enter', { noteId: note.id });
                                                        }}
                                                    >
                                                        <div 
                                                            className="eye-icon"
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                fontSize: '18px'
                                                            }}
                                                        >
                                                            👁️
                                                        </div>
                                                    </div>
                                                    
                                                    {/* More images indicator badge */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        left: '8px',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        color: 'var(--text-primary)',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        View All {note.imageUrls.length}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* No Images - Add Images Button */
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '20px',
                                        border: '2px dashed var(--border-color)',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        background: 'var(--bg-secondary)'
                                    }}>
                                        <div style={{
                                            marginBottom: '12px',
                                            color: 'var(--text-secondary)',
                                            fontSize: '14px'
                                        }}>
                                            No images attached to this note
                                        </div>
                                        
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                console.log('[Dashboard] Adding images to note without images:', {
                                                    noteId: note.id,
                                                    filesCount: e.target.files?.length || 0
                                                });
                                                handleAddImages(note.id, e.target.files);
                                            }}
                                            style={{ display: 'none' }}
                                            id={`add-first-images-${note.id}`}
                                        />
                                        <label
                                            htmlFor={`add-first-images-${note.id}`}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px 24px',
                                                fontSize: '14px',
                                                cursor: isUploadingImages ? 'not-allowed' : 'pointer',
                                                opacity: isUploadingImages ? 0.7 : 1,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isUploadingImages) {
                                                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                                                    (e.target as HTMLElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isUploadingImages) {
                                                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                                                    (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                                }
                                            }}
                                        >
                                            {isUploadingImages ? (
                                                <>
                                                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                                                    Adding Images...
                                                </>
                                            ) : (
                                                <>
                                                    📸 Add Images
                                                </>
                                            )}
                                        </label>
                                        
                                        <div style={{
                                            marginTop: '8px',
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Click to select and upload images
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="note-card-actions">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="note-action-btn edit"
                                        title="Edit Note"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openShareModal(note)}
                                        className="note-action-btn share"
                                        title="Share Note"
                                    >
                                        Share
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(note)}
                                        className="note-action-btn delete"
                                        title="Delete Note"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Note Modal */}
                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Create New Note</h2>
                                <button 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewNote({ title: '', content: '' });
                                        setSelectedFiles([]);
                                        setError(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter note title..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Content
                                </label>
                                <RichTextEditor
                                    value={newNote.content}
                                    onChange={(content) => setNewNote(prev => ({ ...prev, content }))}
                                    placeholder="Write your note content... Use the toolbar for formatting and click '+ Add Task' to create tasks."
                                    height="250px"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Images (optional)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '2px dashed var(--border-color)',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                    Select multiple images (PNG, JPG, JPEG, GIF) - you can add more files by selecting again
                                </small>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Selected Images ({selectedFiles.length}):</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                                        {selectedFiles.map((file, index) => {
                                            const imageUrl = URL.createObjectURL(file);
                                            return (
                                                <div key={index} style={{
                                                    position: 'relative',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: '2px solid var(--border-color)',
                                                    background: 'var(--bg-secondary)'
                                                }}>
                                                    <img
                                                        src={imageUrl}
                                                        alt={file.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100px',
                                                            objectFit: 'cover'
                                                        }}
                                                        onLoad={() => {
                                                            // Clean up object URL after loading
                                                            setTimeout(() => URL.revokeObjectURL(imageUrl), 100);
                                                        }}
                                                    />
                                                    
                                                    {/* File name overlay */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        padding: '4px 6px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {file.name}
                                                    </div>
                                                    
                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => {
                                                            console.log('[Dashboard] Removing file:', file.name);
                                                            removeFile(index);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            background: 'rgba(220, 38, 38, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '24px',
                                                            height: '24px',
                                                            color: 'white',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title={`Remove ${file.name}`}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewNote({ title: '', content: '' });
                                        setSelectedFiles([]);
                                        setError(null);
                                    }}
                                    className="btn btn-secondary"
                                    disabled={isCreating}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createNote}
                                    className="btn btn-primary"
                                    disabled={isCreating || !newNote.title.trim() || !newNote.content.trim()}
                                    style={{ padding: '12px 24px' }}
                                >
                                    {isCreating ? 'Creating...' : 'Create Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Edit Note Modal */}
                {showEditModal && editingNote && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Edit Note</h2>
                                <button 
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingNote(null);
                                        setEditNote({ title: '', content: '' });
                                        setError(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editNote.title}
                                    onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter note title..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Content
                                </label>
                                <RichTextEditor
                                    value={editNote.content}
                                    onChange={(content) => setEditNote(prev => ({ ...prev, content }))}
                                    placeholder="Edit your note content... Use the toolbar for formatting and tasks."
                                    height="250px"
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingNote(null);
                                        setEditNote({ title: '', content: '' });
                                        setError(null);
                                    }}
                                    className="btn btn-secondary"
                                    disabled={isUpdating}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateNote}
                                    className="btn btn-primary"
                                    disabled={isUpdating || !editNote.title.trim() || !editNote.content.trim()}
                                    style={{ padding: '12px 24px' }}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Share Note Modal */}
                {showShareModal && sharingNote && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Share Note: {sharingNote.title}</h2>
                                <button 
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setSharingNote(null);
                                        setShareLinks([]);
                                        setError(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Create New Share Link</h3>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        Access Level
                                    </label>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="radio"
                                                name="accessLevel"
                                                value="VIEWER"
                                                checked={selectedAccessLevel === 'VIEWER'}
                                                onChange={(e) => setSelectedAccessLevel(e.target.value as 'VIEWER' | 'EDITOR')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ color: 'var(--text-primary)' }}>Viewer (Read Only)</span>
                                        </label>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="radio"
                                                name="accessLevel"
                                                value="EDITOR"
                                                checked={selectedAccessLevel === 'EDITOR'}
                                                onChange={(e) => setSelectedAccessLevel(e.target.value as 'VIEWER' | 'EDITOR')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ color: 'var(--text-primary)' }}>Editor (Can Edit)</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={createShareLink}
                                    className="btn btn-primary"
                                    disabled={isCreatingShare}
                                    style={{ width: '100%', padding: '12px' }}
                                >
                                    {isCreatingShare ? 'Creating Share Link...' : 'Create Share Link'}
                                </button>
                            </div>
                            
                            <div>
                                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Existing Share Links</h3>
                                
                                {loadingShares ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                        Loading share links...
                                    </div>
                                ) : shareLinks.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                        No share links created yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {shareLinks.map((shareLink) => (
                                            <div key={shareLink.id} style={{
                                                padding: '16px',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                backgroundColor: 'var(--bg-secondary)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ flex: 1, marginRight: '12px' }}>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Access: {shareLink.accessLevel === 'VIEWER' ? 'Viewer (Read Only)' : 'Editor (Can Edit)'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: 'var(--text-secondary)',
                                                            fontFamily: 'monospace',
                                                            backgroundColor: 'var(--bg-primary)',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {`${window.location.origin}/shared/${shareLink.shareId}`}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        flexShrink: 0
                                                    }}>
                                                        <button
                                                            onClick={() => copyShareLink(shareLink.shareId)}
                                                            className="btn btn-secondary"
                                                            style={{
                                                                padding: '8px 16px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            Copy
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteShareModal(shareLink)}
                                                            style={{
                                                                background: '#e53e3e',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '8px 16px',
                                                                fontSize: '14px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                            title="Delete Share Link"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-secondary)',
                                                    marginTop: '8px'
                                                }}>
                                                    Created: {new Date(shareLink.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Delete Confirmation Modal */}
                {showDeleteModal && deletingNote && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '400px'
                        }}>
                            <h2 style={{ 
                                margin: '0 0 16px 0', 
                                color: 'var(--text-primary)',
                                textAlign: 'center'
                            }}>
                                Confirm Delete
                            </h2>
                            
                            <p style={{
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginBottom: '24px',
                                lineHeight: '1.5'
                            }}>
                                Are you sure you want to delete the note "<strong>{deletingNote.title}</strong>"? 
                                This action cannot be undone.
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingNote(null);
                                        setError(null);
                                    }}
                                    className="btn btn-secondary"
                                    disabled={isDeleting}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteNote}
                                    style={{
                                        background: '#e53e3e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                                        opacity: isDeleting ? 0.7 : 1
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Simple Image Viewer */}
                <SimpleImageViewer
                    images={viewerImages}
                    isOpen={showImageViewer}
                    onClose={closeImageViewer}
                    initialIndex={viewerInitialIndex}
                    onDeleteImage={handleDeleteImage}
                    canDelete={true}
                />
                
                {/* Delete Share Link Confirmation Modal */}
                {showDeleteShareModal && deletingShareLink && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '400px'
                        }}>
                            <h2 style={{ 
                                margin: '0 0 16px 0', 
                                color: 'var(--text-primary)',
                                textAlign: 'center'
                            }}>
                                Delete Share Link?
                            </h2>
                            
                            <p style={{
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginBottom: '8px',
                                lineHeight: '1.5'
                            }}>
                                Are you sure you want to delete this share link?
                            </p>
                            
                            <p style={{
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginBottom: '24px',
                                fontSize: '14px',
                                fontStyle: 'italic'
                            }}>
                                <strong>Access Level:</strong> {deletingShareLink.accessLevel === 'VIEWER' ? 'Viewer (Read Only)' : 'Editor (Can Edit)'}<br/>
                                People with this link will no longer be able to access the note.
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowDeleteShareModal(false);
                                        setDeletingShareLink(null);
                                        setError(null);
                                    }}
                                    className="btn btn-secondary"
                                    disabled={isDeletingShare}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteShareLink}
                                    style={{
                                        background: '#e53e3e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: isDeletingShare ? 'not-allowed' : 'pointer',
                                        opacity: isDeletingShare ? 0.7 : 1
                                    }}
                                    disabled={isDeletingShare}
                                >
                                    {isDeletingShare ? 'Deleting...' : 'Delete Share Link'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{ 
                                    margin: 0, 
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📊 {feedbackHasSubmitted ? 'Update Your Rating' : 'Rate Your Experience'}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedbackRating(0);
                                        setFeedbackMessage('');
                                        setError(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {feedbackHasSubmitted && existingFeedback && (
                                <div style={{
                                    background: '#e6fffa',
                                    border: '1px solid #38b2ac',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    marginBottom: '20px'
                                }}>
                                    <p style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '14px',
                                        color: '#2c7a7b',
                                        fontWeight: '600'
                                    }}>
                                        ✨ You previously rated us {existingFeedback.rating}/5 stars
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: '#2c7a7b'
                                    }}>
                                        You can update your rating and feedback below.
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '12px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    fontSize: '16px'
                                }}>
                                    How would you rate NotesApp? *
                                </label>
                                
                                {/* Star Rating */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    justifyContent: 'center'
                                }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => {
                                                console.log('[Dashboard] Star rating selected:', star);
                                                setFeedbackRating(star);
                                                setError(null);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '32px',
                                                cursor: 'pointer',
                                                color: star <= feedbackRating ? '#fbbf24' : '#d1d5db',
                                                transition: 'all 0.2s ease',
                                                borderRadius: '4px',
                                                padding: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.target as HTMLElement).style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.target as HTMLElement).style.transform = 'scale(1)';
                                            }}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                                
                                {feedbackRating > 0 && (
                                    <p style={{
                                        textAlign: 'center',
                                        margin: '8px 0 0 0',
                                        fontSize: '14px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        You selected {feedbackRating} star{feedbackRating !== 1 ? 's' : ''}
                                        {feedbackRating <= 2 && ' - We\'d love to improve!'}
                                        {feedbackRating === 3 && ' - Thank you for the feedback!'}
                                        {feedbackRating >= 4 && ' - Thank you! We\'re glad you like NotesApp!'}
                                    </p>
                                )}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Tell us more (optional)
                                </label>
                                <textarea
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder={`What ${feedbackRating <= 2 ? 'could we improve' : feedbackRating === 3 ? 'do you think about NotesApp' : 'do you love most about NotesApp'}?`}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        lineHeight: '1.5'
                                    }}
                                />
                                <small style={{
                                    display: 'block',
                                    marginTop: '6px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px'
                                }}>
                                    Your feedback helps us improve the app for everyone.
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedbackRating(0);
                                        setFeedbackMessage('');
                                        setError(null);
                                    }}
                                    className="btn btn-secondary"
                                    disabled={feedbackSubmitting}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitFeedback}
                                    style={{
                                        background: feedbackRating > 0 
                                            ? 'linear-gradient(135deg, #48bb78, #38a169)' 
                                            : 'var(--border-color)',
                                        color: feedbackRating > 0 ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: feedbackRating > 0 && !feedbackSubmitting ? 'pointer' : 'not-allowed',
                                        opacity: feedbackSubmitting ? 0.7 : 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                    disabled={feedbackRating === 0 || feedbackSubmitting}
                                >
                                    {feedbackSubmitting 
                                        ? 'Submitting...' 
                                        : feedbackHasSubmitted 
                                        ? 'Update Feedback' 
                                        : 'Submit Feedback'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesDashboardPage;
