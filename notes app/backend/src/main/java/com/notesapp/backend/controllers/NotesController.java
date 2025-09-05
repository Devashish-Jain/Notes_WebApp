package com.notesapp.backend.controllers;

import com.notesapp.backend.entities.Note;
import com.notesapp.backend.entities.ShareLink;
import com.notesapp.backend.entities.User;
import com.notesapp.backend.enums.AccessLevel;
import com.notesapp.backend.services.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NotesController {

    @Autowired
    private NoteService noteService;

    @GetMapping("/notes")
    public ResponseEntity<List<Note>> getUserNotes(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Note> notes = noteService.getUserNotes(user);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes")
    public ResponseEntity<?> createNote(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            Note note = noteService.createNote(title, content, images, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(note);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            Note note = noteService.updateNote(id, request.get("title"), request.get("content"), user);
            return ResponseEntity.ok(note);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            noteService.deleteNote(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/notes/{noteId}/images")
    public ResponseEntity<?> addImagesToNote(
            @PathVariable Long noteId,
            @RequestParam("images") MultipartFile[] images,
            Authentication authentication
    ) {
        System.out.println("[NotesController] POST /notes/" + noteId + "/images - Adding images to note");
        System.out.println("[NotesController] Images count: " + (images != null ? images.length : 0));
        try {
            User user = (User) authentication.getPrincipal();
            System.out.println("[NotesController] User: " + user.getEmail() + ", Note ID: " + noteId);
            
            Note note = noteService.addImagesToNote(noteId, images, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("imageUrls", note.getImageUrls());
            response.put("message", "Images added successfully");
            
            System.out.println("[NotesController] Images added successfully. New count: " + note.getImageUrls().size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("[NotesController] Error adding images to note " + noteId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("[NotesController] Unexpected error adding images to note " + noteId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @DeleteMapping("/notes/{noteId}/images")
    public ResponseEntity<?> deleteImageFromNote(
            @PathVariable Long noteId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        System.out.println("[NotesController] DELETE /notes/" + noteId + "/images - Deleting image from note");
        try {
            User user = (User) authentication.getPrincipal();
            String imageUrl = request.get("imageUrl");
            System.out.println("[NotesController] User: " + user.getEmail() + ", Note ID: " + noteId);
            System.out.println("[NotesController] Image URL to delete: " + (imageUrl != null ? imageUrl.substring(0, Math.min(50, imageUrl.length())) + "..." : "null"));
            
            Note note = noteService.deleteImageFromNote(noteId, imageUrl, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("imageUrls", note.getImageUrls());
            response.put("message", "Image deleted successfully");
            
            System.out.println("[NotesController] Image deleted successfully. Remaining count: " + note.getImageUrls().size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("[NotesController] Error deleting image from note " + noteId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("[NotesController] Unexpected error deleting image from note " + noteId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/notes/{noteId}/share")
    public ResponseEntity<?> createShareLink(
            @PathVariable Long noteId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            AccessLevel accessLevel = AccessLevel.valueOf(request.get("accessLevel"));
            ShareLink shareLink = noteService.createShareLink(noteId, accessLevel, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("shareableLink", "/view/note/" + shareLink.getShareId());
            response.put("accessLevel", shareLink.getAccessLevel().toString());
            response.put("shareId", shareLink.getShareId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/notes/{noteId}/shares")
    public ResponseEntity<?> getNoteShareLinks(
            @PathVariable Long noteId,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            List<ShareLink> shareLinks = noteService.getNoteShareLinks(noteId, user);
            return ResponseEntity.ok(shareLinks);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/shares/{shareId}")
    public ResponseEntity<?> deleteShareLink(
            @PathVariable String shareId,
            Authentication authentication
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            noteService.deleteShareLink(shareId, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/public/notes/{shareId}")
    public ResponseEntity<?> getSharedNote(@PathVariable String shareId) {
        try {
            Note note = noteService.getSharedNote(shareId);
            AccessLevel accessLevel = noteService.getShareAccessLevel(shareId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("title", note.getTitle());
            response.put("content", note.getContent());
            response.put("createdAt", note.getCreatedAt());
            response.put("imageUrls", note.getImageUrls());
            response.put("accessLevel", accessLevel.toString());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/public/notes/{shareId}")
    public ResponseEntity<?> updateSharedNote(
            @PathVariable String shareId,
            @RequestBody Map<String, String> request
    ) {
        try {
            Note note = noteService.updateSharedNote(shareId, request.get("title"), request.get("content"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("title", note.getTitle());
            response.put("content", note.getContent());
            response.put("updatedAt", note.getUpdatedAt());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/public/notes/{shareId}/images")
    public ResponseEntity<?> addImagesToSharedNote(
            @PathVariable String shareId,
            @RequestParam("images") MultipartFile[] images
    ) {
        try {
            Note note = noteService.addImagesToSharedNote(shareId, images);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("imageUrls", note.getImageUrls());
            response.put("message", "Images added successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/public/notes/{shareId}/images")
    public ResponseEntity<?> deleteImageFromSharedNote(
            @PathVariable String shareId,
            @RequestBody Map<String, String> request
    ) {
        try {
            String imageUrl = request.get("imageUrl");
            Note note = noteService.deleteImageFromSharedNote(shareId, imageUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", note.getId());
            response.put("imageUrls", note.getImageUrls());
            response.put("message", "Image deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
