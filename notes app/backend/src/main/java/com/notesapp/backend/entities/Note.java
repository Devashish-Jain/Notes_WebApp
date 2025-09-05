package com.notesapp.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notes", indexes = {
    @Index(name = "idx_note_user", columnList = "user_id"),
    @Index(name = "idx_note_created_at", columnList = "created_at"),
    @Index(name = "idx_note_title", columnList = "title")
})
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // Store comma-separated Cloudinary URLs

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<NoteImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ShareLink> shareLinks = new ArrayList<>();

    // Constructors
    public Note() {}

    public Note(String title, String content, User user) {
        this.title = title;
        this.content = content;
        this.user = user;
    }

    // Utility methods
    public List<String> getImageUrls() {
        if (imageUrls == null || imageUrls.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(imageUrls.split(",")));
    }
    
    public void setImageUrlsFromList(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            this.imageUrls = null;
        } else {
            this.imageUrls = String.join(",", urls);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<NoteImage> getImages() {
        return images;
    }

    public void setImages(List<NoteImage> images) {
        this.images = images;
    }

    public List<ShareLink> getShareLinks() {
        return shareLinks;
    }

    public void setShareLinks(List<ShareLink> shareLinks) {
        this.shareLinks = shareLinks;
    }
    
    public String getImageUrlsString() {
        return imageUrls;
    }
    
    public void setImageUrlsString(String imageUrls) {
        this.imageUrls = imageUrls;
    }
}
