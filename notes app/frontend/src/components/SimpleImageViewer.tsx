import React, { useState, useEffect } from 'react';

interface SimpleImageViewerProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number;
    onDeleteImage?: (imageUrl: string, index: number) => void;
    canDelete?: boolean;
}

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({ 
    images, 
    isOpen, 
    onClose, 
    initialIndex = 0,
    onDeleteImage,
    canDelete = false
}) => {
    console.log('[SimpleImageViewer] Component rendered:', {
        isOpen,
        imagesCount: images.length,
        initialIndex,
        canDelete,
        currentTimestamp: new Date().toISOString()
    });
    
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, currentIndex]);

    const goToNext = () => {
        console.log('[SimpleImageViewer] Going to next image:', currentIndex + 1);
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        console.log('[SimpleImageViewer] Going to previous image:', currentIndex - 1);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDeleteImage = () => {
        if (onDeleteImage && canDelete) {
            onDeleteImage(images[currentIndex], currentIndex);
            // Navigate to previous image or close if this was the last image
            if (images.length === 1) {
                onClose();
            } else if (currentIndex === images.length - 1) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    if (!isOpen || images.length === 0) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={() => {
                console.log('[SimpleImageViewer] Overlay clicked - closing viewer');
                onClose();
            }}
        >
            <div 
                style={{
                    position: 'relative',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        console.log('[SimpleImageViewer] Close button clicked');
                        onClose();
                    }}
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '0px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10
                    }}
                    title="Close (Esc)"
                >
                    ×
                </button>

                {/* Delete Button (for editors) */}
                {canDelete && onDeleteImage && (
                    <button
                        onClick={handleDeleteImage}
                        style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '50px',
                            background: 'rgba(220, 38, 38, 0.8)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            zIndex: 10
                        }}
                        title="Delete Image"
                    >
                        🗑️
                    </button>
                )}

                {/* Previous Button */}
                {images.length > 1 && currentIndex > 0 && (
                    <button
                        onClick={goToPrevious}
                        style={{
                            position: 'absolute',
                            left: '-60px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}
                        title="Previous (←)"
                    >
                        ←
                    </button>
                )}

                {/* Main Image */}
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1} of ${images.length}`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                    }}
                    onError={(e) => {
                        console.error('Failed to load image:', images[currentIndex]);
                    }}
                />

                {/* Next Button */}
                {images.length > 1 && currentIndex < images.length - 1 && (
                    <button
                        onClick={goToNext}
                        style={{
                            position: 'absolute',
                            right: '-60px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}
                        title="Next (→)"
                    >
                        →
                    </button>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-50px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {currentIndex + 1} of {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleImageViewer;
