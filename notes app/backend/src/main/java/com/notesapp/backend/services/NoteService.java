package com.notesapp.backend.services;

import com.notesapp.backend.entities.Note;
import com.notesapp.backend.entities.NoteImage;
import com.notesapp.backend.entities.ShareLink;
import com.notesapp.backend.entities.User;
import com.notesapp.backend.enums.AccessLevel;
import com.notesapp.backend.repositories.NoteRepository;
import com.notesapp.backend.repositories.ShareLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private ShareLinkRepository shareLinkRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Note> getUserNotes(User user) {
        return noteRepository.findByUserWithImages(user);
    }

    public Note createNote(String title, String content, MultipartFile[] images, User user) {
        Note note = new Note(title, content, user);
        
        // Upload images to Cloudinary if provided
        if (images != null && images.length > 0) {
            try {
                List<String> imageUrls = fileStorageService.storeFilesInCloudinary(images);
                note.setImageUrlsFromList(imageUrls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images to Cloudinary: " + e.getMessage());
            }
        }
        
        return noteRepository.save(note);
    }
    
    public Note addImagesToNote(Long noteId, MultipartFile[] images, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        if (images != null && images.length > 0) {
            try {
                List<String> newImageUrls = fileStorageService.storeFilesInCloudinary(images);
                List<String> existingImageUrls = note.getImageUrls();
                existingImageUrls.addAll(newImageUrls);
                note.setImageUrlsFromList(existingImageUrls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images to Cloudinary: " + e.getMessage());
            }
        }
        
        return noteRepository.save(note);
    }
    
    public Note deleteImageFromNote(Long noteId, String imageUrl, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        List<String> imageUrls = note.getImageUrls();
        
        if (imageUrls.contains(imageUrl)) {
            // Delete from Cloudinary
            String publicId = fileStorageService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                fileStorageService.deleteImageFromCloudinary(publicId);
            }
            
            // Remove from note
            imageUrls.remove(imageUrl);
            note.setImageUrlsFromList(imageUrls);
        } else {
            throw new RuntimeException("Image not found in this note");
        }
        
        return noteRepository.save(note);
    }

    public Note updateNote(Long noteId, String title, String content, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public void deleteNote(Long noteId, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        // Delete images from Cloudinary before deleting the note
        List<String> imageUrls = note.getImageUrls();
        for (String imageUrl : imageUrls) {
            String publicId = fileStorageService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                fileStorageService.deleteImageFromCloudinary(publicId);
            }
        }

        noteRepository.delete(note);
    }

    public ShareLink createShareLink(Long noteId, AccessLevel accessLevel, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        String shareId = UUID.randomUUID().toString();
        ShareLink shareLink = new ShareLink(shareId, accessLevel, note);
        return shareLinkRepository.save(shareLink);
    }

    public List<ShareLink> getNoteShareLinks(Long noteId, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return shareLinkRepository.findByNote(note);
    }

    public Note getSharedNote(String shareId) {
        ShareLink shareLink = shareLinkRepository.findByShareIdWithNoteAndImages(shareId)
                .orElseThrow(() -> new RuntimeException("Shared note not found"));
        
        return shareLink.getNote();
    }

    public Note updateSharedNote(String shareId, String title, String content) {
        ShareLink shareLink = shareLinkRepository.findByShareIdWithNoteAndImages(shareId)
                .orElseThrow(() -> new RuntimeException("Shared note not found"));
        
        if (shareLink.getAccessLevel() != AccessLevel.EDITOR) {
            throw new RuntimeException("No edit permission");
        }

        Note note = shareLink.getNote();
        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public AccessLevel getShareAccessLevel(String shareId) {
        ShareLink shareLink = shareLinkRepository.findByShareId(shareId)
                .orElseThrow(() -> new RuntimeException("Share link not found"));
        return shareLink.getAccessLevel();
    }
    
    public void deleteShareLink(String shareId, User user) {
        ShareLink shareLink = shareLinkRepository.findByShareIdWithNote(shareId)
                .orElseThrow(() -> new RuntimeException("Share link not found"));
        
        // Check if the user owns the note associated with this share link
        if (!shareLink.getNote().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        shareLinkRepository.delete(shareLink);
    }
    
    public Note addImagesToSharedNote(String shareId, MultipartFile[] images) {
        ShareLink shareLink = shareLinkRepository.findByShareIdWithNoteAndImages(shareId)
                .orElseThrow(() -> new RuntimeException("Shared note not found"));
        
        if (shareLink.getAccessLevel() != AccessLevel.EDITOR) {
            throw new RuntimeException("No edit permission");
        }
        
        Note note = shareLink.getNote();
        
        if (images != null && images.length > 0) {
            try {
                List<String> newImageUrls = fileStorageService.storeFilesInCloudinary(images);
                List<String> existingImageUrls = note.getImageUrls();
                existingImageUrls.addAll(newImageUrls);
                note.setImageUrlsFromList(existingImageUrls);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload images to Cloudinary: " + e.getMessage());
            }
        }
        
        return noteRepository.save(note);
    }
    
    public Note deleteImageFromSharedNote(String shareId, String imageUrl) {
        ShareLink shareLink = shareLinkRepository.findByShareIdWithNoteAndImages(shareId)
                .orElseThrow(() -> new RuntimeException("Shared note not found"));
        
        if (shareLink.getAccessLevel() != AccessLevel.EDITOR) {
            throw new RuntimeException("No edit permission");
        }
        
        Note note = shareLink.getNote();
        List<String> imageUrls = note.getImageUrls();
        
        if (imageUrls.contains(imageUrl)) {
            // Delete from Cloudinary
            String publicId = fileStorageService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                fileStorageService.deleteImageFromCloudinary(publicId);
            }
            
            // Remove from note
            imageUrls.remove(imageUrl);
            note.setImageUrlsFromList(imageUrls);
        } else {
            throw new RuntimeException("Image not found in this note");
        }
        
        return noteRepository.save(note);
    }
}
