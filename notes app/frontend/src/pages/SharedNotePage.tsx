import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SimpleImageViewer from '../components/SimpleImageViewer';
import RichTextEditor from '../components/RichTextEditor';
import NoteContentRenderer from '../components/NoteContentRenderer';

interface SharedNote {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    imageUrls: string[];
    accessLevel: 'VIEWER' | 'EDITOR';
}

const SharedNotePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [note, setNote] = useState<SharedNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Image Viewer State
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImages, setViewerImages] = useState<string[]>([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
    
    // Image Management State (for editors)
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    
    // Debug state
    const [clickCount, setClickCount] = useState(0);
    
    console.log('[SharedNotePage] Component mounted/updated:', {
        shareId,
        note: note ? { id: note.id, title: note.title, imageCount: note.imageUrls?.length } : null,
        loading,
        error,
        showImageViewer,
        clickCount
    });
    

    useEffect(() => {
        if (shareId) {
            fetchSharedNote();
        }
    }, [shareId]);
    

    const fetchSharedNote = async () => {
        console.log('[SharedNotePage] Fetching shared note for shareId:', shareId);
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/public/notes/${shareId}`
            );
            console.log('[SharedNotePage] Shared note fetched successfully:', {
                id: response.data.id,
                title: response.data.title,
                imageUrls: response.data.imageUrls,
                accessLevel: response.data.accessLevel
            });
            setNote(response.data);
            setEditTitle(response.data.title);
            setEditContent(response.data.content);
            setError(null);
        } catch (error: any) {
            console.error('[SharedNotePage] Failed to fetch shared note:', error);
            setError('Failed to load shared note. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (note) {
            setEditTitle(note.title);
            setEditContent(note.content);
        }
        setError(null);
    };

    const handleSave = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            setError('Please fill in both title and content');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/public/notes/${shareId}`,
                {
                    title: editTitle,
                    content: editContent
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            if (note) {
                setNote({
                    ...note,
                    title: editTitle,
                    content: editContent
                });
            }

            setIsEditing(false);
            showSuccess('Note updated successfully!');

        } catch (error: any) {
            console.error('Failed to update shared note:', error);
            setError('Failed to update note. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    // Image Viewing Functions
    const openImageViewer = (images: string[], initialIndex: number = 0) => {
        console.log('[SharedNotePage] Opening image viewer:', {
            images,
            initialIndex,
            currentClickCount: clickCount + 1
        });
        setClickCount(prev => prev + 1);
        setViewerImages([...images]);
        setViewerInitialIndex(initialIndex);
        setShowImageViewer(true);
    };
    
    const closeImageViewer = () => {
        setShowImageViewer(false);
        setViewerImages([]);
        setViewerInitialIndex(0);
    };
    
    // Image Management Functions (for editors)
    const handleAddImages = async (files: FileList | null) => {
        if (!files || files.length === 0 || !note) return;
        
        try {
            setIsUploadingImages(true);
            
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                if (file.type.startsWith('image/')) {
                    formData.append('images', file);
                }
            });
            
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/public/notes/${shareId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            // Refresh the note data
            await fetchSharedNote();
            showSuccess('Images added successfully!');
            
        } catch (error: any) {
            console.error('Failed to add images:', error);
            setError('Failed to add images. Please try again.');
        } finally {
            setIsUploadingImages(false);
        }
    };
    
    // Handle real-time content updates (for task completion)
    const handleSaveContent = async (newContent: string) => {
        if (!note) return;
        
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/public/notes/${shareId}`,
                {
                    title: note.title,
                    content: newContent
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Update local state
            setNote({
                ...note,
                content: newContent
            });
            
        } catch (error: any) {
            console.error('Failed to update note content:', error);
        }
    };
    
    const handleDeleteImage = async (imageUrl: string) => {
        if (!note) return;
        
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/public/notes/${shareId}/images`,
                {
                    data: { imageUrl },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Refresh the note data
            await fetchSharedNote();
            showSuccess('Image deleted successfully!');
            
        } catch (error: any) {
            console.error('Failed to delete image:', error);
            setError('Failed to delete image. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="loading">Loading shared note...</div>
                </div>
            </div>
        );
    }

    if (error && !note) {
        return (
            <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        background: '#fed7d7',
                        color: '#c53030',
                        padding: '24px',
                        borderRadius: '12px',
                        fontSize: '18px'
                    }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div>Note not found.</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '100px 20px 20px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            margin: '0 0 8px 0'
                        }}>
                            Shared Note
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            <span>Access Level: <strong>{note.accessLevel === 'VIEWER' ? 'Viewer (Read Only)' : 'Editor (Can Edit)'}</strong></span>
                            <span>•</span>
                            <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {note.accessLevel === 'EDITOR' && !isEditing && (
                            <button
                                onClick={handleEdit}
                                className="btn btn-primary"
                                style={{ padding: '12px 24px' }}
                            >
                                Edit Note
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
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

                {/* Note Content */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                }}>
                    {isEditing ? (
                        // Edit Mode
                        <div>
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
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Enter note title..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    Content
                                </label>
                                <RichTextEditor
                                    value={editContent}
                                    onChange={setEditContent}
                                    placeholder="Edit the shared note content... Use the toolbar for formatting and tasks."
                                    height="300px"
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={handleCancelEdit}
                                    className="btn btn-secondary"
                                    disabled={isSaving}
                                    style={{ padding: '12px 24px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    disabled={isSaving || !editTitle.trim() || !editContent.trim()}
                                    style={{ padding: '12px 24px' }}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '600',
                                marginBottom: '24px',
                                color: 'var(--text-primary)'
                            }}>
                                {note.title}
                            </h2>
                            
                            <div style={{
                                marginBottom: '24px'
                            }}>
                                <NoteContentRenderer 
                                    content={note.content}
                                    editable={note.accessLevel === 'EDITOR'}
                                    onContentChange={(newContent) => {
                                        if (note) {
                                            // Update content for real-time task interaction
                                            handleSaveContent(newContent);
                                        }
                                    }}
                                    onTaskToggle={handleSaveContent}
                                />
                            </div>

                            {/* Images */}
                            {note.imageUrls && note.imageUrls.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            margin: 0,
                                            color: 'var(--text-primary)'
                                        }}>
                                            Attachments ({note.imageUrls.length})
                                        </h3>
                                        
                                        {/* Add Images Button (for editors) */}
                                        {note.accessLevel === 'EDITOR' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => handleAddImages(e.target.files)}
                                                    style={{ display: 'none' }}
                                                    id="add-images-input"
                                                />
                                                <label
                                                    htmlFor="add-images-input"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #48bb78, #38a169)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 16px',
                                                        fontSize: '14px',
                                                        cursor: isUploadingImages ? 'not-allowed' : 'pointer',
                                                        opacity: isUploadingImages ? 0.7 : 1,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    {isUploadingImages ? 'Uploading...' : '+ Add Images'}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '16px'
                                    }}>
                                            {note.imageUrls.map((imageUrl, index) => {
                                                console.log('[SharedNotePage] Rendering image:', { index, imageUrl: imageUrl.substring(0, 50) + '...' });
                                                return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    className="image-container"
                                                    onClick={() => {
                                                        console.log('[SharedNotePage] Image container clicked!', {
                                                            index,
                                                            imageUrl: imageUrl.substring(0, 50) + '...'
                                                        });
                                                        openImageViewer(note.imageUrls, index);
                                                    }}
                                                    onMouseEnter={() => {
                                                        console.log('[SharedNotePage] Mouse enter on image container', index);
                                                    }}
                                                    onMouseLeave={() => {
                                                        console.log('[SharedNotePage] Mouse leave on image container', index);
                                                    }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Note attachment ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                        onError={(e) => {
                                                            console.log('[SharedNotePage] Image load error:', imageUrl);
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('[SharedNotePage] Image loaded successfully:', index);
                                                        }}
                                                        onClick={(e) => {
                                                            console.log('[SharedNotePage] Direct image click!', { index, event: e });
                                                            e.stopPropagation();
                                                            openImageViewer(note.imageUrls, index);
                                                        }}
                                                    />
                                                
                                                {/* Hover Eye Icon */}
                                                <div 
                                                    className="image-overlay"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'rgba(0, 0, 0, 0.4)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onClick={(e) => {
                                                        console.log('[SharedNotePage] Overlay clicked!', { index, event: e });
                                                        e.stopPropagation();
                                                        openImageViewer(note.imageUrls, index);
                                                    }}
                                                    onMouseEnter={() => {
                                                        console.log('[SharedNotePage] Overlay mouse enter', index);
                                                    }}
                                                >
                                                    <div className="eye-icon">
                                                        👁️
                                                    </div>
                                                </div>
                                                
                                                {/* Delete Button (for editors) */}
                                                {note.accessLevel === 'EDITOR' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteImage(imageUrl);
                                                        }}
                                                        className="image-delete-btn"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            right: '8px',
                                                            background: 'rgba(220, 38, 38, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '30px',
                                                            height: '30px',
                                                            color: 'white',
                                                            fontSize: '16px',
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
                                                )}
                                                
                                                {/* Image Number Badge */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '8px',
                                                    right: '8px',
                                                    background: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {index + 1} of {note.imageUrls.length}
                                                </div>
                                            </div>
                                        );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Simple Image Viewer */}
                <SimpleImageViewer
                    images={viewerImages}
                    isOpen={showImageViewer}
                    onClose={closeImageViewer}
                    initialIndex={viewerInitialIndex}
                    onDeleteImage={handleDeleteImage}
                    canDelete={note?.accessLevel === 'EDITOR'}
                />
            </div>
        </div>
    );
};

export default SharedNotePage;
