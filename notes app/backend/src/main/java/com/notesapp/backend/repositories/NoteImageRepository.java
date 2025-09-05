package com.notesapp.backend.repositories;

import com.notesapp.backend.entities.NoteImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteImageRepository extends JpaRepository<NoteImage, Long> {
}
