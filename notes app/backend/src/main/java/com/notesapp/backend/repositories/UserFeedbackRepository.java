package com.notesapp.backend.repositories;

import com.notesapp.backend.entities.User;
import com.notesapp.backend.entities.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    
    // Check if user has already submitted feedback
    Optional<UserFeedback> findByUser(User user);
    boolean existsByUser(User user);
    
    // Get average rating for satisfaction calculation
    @Query("SELECT AVG(f.rating) FROM UserFeedback f")
    Double getAverageRating();
    
    // Count total feedback entries
    @Query("SELECT COUNT(f) FROM UserFeedback f")
    long countFeedback();
    
    // Get rating distribution
    @Query("SELECT f.rating, COUNT(f) FROM UserFeedback f GROUP BY f.rating ORDER BY f.rating")
    Object[][] getRatingDistribution();
}
