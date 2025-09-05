package com.notesapp.backend.services;

import com.notesapp.backend.entities.User;
import com.notesapp.backend.entities.UserFeedback;
import com.notesapp.backend.repositories.UserFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class FeedbackService {

    @Autowired
    private UserFeedbackRepository feedbackRepository;

    public UserFeedback submitFeedback(User user, Integer rating, String message) {
        // Check if user has already submitted feedback
        Optional<UserFeedback> existingFeedback = feedbackRepository.findByUser(user);
        
        if (existingFeedback.isPresent()) {
            throw new RuntimeException("You have already submitted feedback. You can update your existing feedback.");
        }

        UserFeedback feedback = new UserFeedback(rating, message, user);
        UserFeedback saved = feedbackRepository.save(feedback);
        
        System.out.println("[FeedbackService] Feedback saved: ID=" + saved.getId() + ", Rating=" + rating);
        return saved;
    }

    public UserFeedback updateFeedback(User user, Integer rating, String message) {
        UserFeedback existingFeedback = feedbackRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No existing feedback found to update"));

        existingFeedback.setRating(rating);
        existingFeedback.setMessage(message);
        
        UserFeedback updated = feedbackRepository.save(existingFeedback);
        System.out.println("[FeedbackService] Feedback updated: ID=" + updated.getId() + ", New Rating=" + rating);
        return updated;
    }

    public boolean hasUserSubmittedFeedback(User user) {
        return feedbackRepository.existsByUser(user);
    }

    public UserFeedback getUserFeedback(User user) {
        return feedbackRepository.findByUser(user).orElse(null);
    }

    public Double getAverageSatisfactionRating() {
        Double avgRating = feedbackRepository.getAverageRating();
        if (avgRating == null) {
            return 4.5; // Default good rating if no feedback yet
        }
        
        // Convert 1-5 scale to percentage (1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
        return (avgRating / 5.0) * 100;
    }

    public long getTotalFeedbackCount() {
        return feedbackRepository.countFeedback();
    }

    public Object[][] getRatingDistribution() {
        return feedbackRepository.getRatingDistribution();
    }
}
