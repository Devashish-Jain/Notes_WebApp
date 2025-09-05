package com.notesapp.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.notesapp.backend.enums.AccessLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "share_links", indexes = {
    @Index(name = "idx_share_link_share_id", columnList = "share_id", unique = true),
    @Index(name = "idx_share_link_note", columnList = "note_id")
})
public class ShareLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Share ID is required")
    @Column(name = "share_id", nullable = false, unique = true)
    private String shareId;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private AccessLevel accessLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    @JsonIgnore
    private Note note;

    // Constructors
    public ShareLink() {}

    public ShareLink(String shareId, AccessLevel accessLevel, Note note) {
        this.shareId = shareId;
        this.accessLevel = accessLevel;
        this.note = note;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShareId() {
        return shareId;
    }

    public void setShareId(String shareId) {
        this.shareId = shareId;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }
}
