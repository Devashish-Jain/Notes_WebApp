package com.notesapp.backend.repositories;

import com.notesapp.backend.entities.Note;
import com.notesapp.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT n FROM Note n LEFT JOIN FETCH n.images WHERE n.user = :user ORDER BY n.createdAt DESC")
    List<Note> findByUserWithImages(@Param("user") User user);
    
    @Query("SELECT n FROM Note n LEFT JOIN FETCH n.images WHERE n.id = :id")
    Note findByIdWithImages(@Param("id") Long id);
}
