package com.notesapp.backend.repositories;

import com.notesapp.backend.entities.Note;
import com.notesapp.backend.entities.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {
    Optional<ShareLink> findByShareId(String shareId);
    List<ShareLink> findByNote(Note note);
    
    @Query("SELECT s FROM ShareLink s JOIN FETCH s.note n LEFT JOIN FETCH n.images WHERE s.shareId = :shareId")
    Optional<ShareLink> findByShareIdWithNoteAndImages(@Param("shareId") String shareId);
    
    @Query("SELECT s FROM ShareLink s JOIN FETCH s.note WHERE s.shareId = :shareId")
    Optional<ShareLink> findByShareIdWithNote(@Param("shareId") String shareId);
}
