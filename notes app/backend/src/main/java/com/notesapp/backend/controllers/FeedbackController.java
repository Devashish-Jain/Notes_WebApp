package com.notesapp.backend.controllers;

import com.notesapp.backend.entities.User;
import com.notesapp.backend.entities.UserFeedback;
import com.notesapp.backend.services.FeedbackService;
import com.notesapp.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserService userService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(
            @RequestBody Map<String, Object> feedbackData,
            Authentication authentication) {
        
        try {
            System.out.println("[FeedbackController] Feedback submission request");
            
            // Get current user
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            // Extract feedback data
            Integer rating = (Integer) feedbackData.get("rating");
            String message = (String) feedbackData.get("message");
            
            System.out.println("[FeedbackController] User: " + email + ", Rating: " + rating);
            
            // Validate rating
            if (rating == null || rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }
            
            // Submit feedback
            UserFeedback feedback = feedbackService.submitFeedback(user, rating, message);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thank you for your feedback!",
                "feedbackId", feedback.getId()
            ));
            
        } catch (RuntimeException e) {
            System.err.println("[FeedbackController] Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("[FeedbackController] Unexpected error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to submit feedback"));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getFeedbackStatus(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            boolean hasSubmitted = feedbackService.hasUserSubmittedFeedback(user);
            UserFeedback existingFeedback = null;
            
            if (hasSubmitted) {
                existingFeedback = feedbackService.getUserFeedback(user);
            }
            
            return ResponseEntity.ok(Map.of(
                "hasSubmitted", hasSubmitted,
                "feedback", existingFeedback != null ? Map.of(
                    "rating", existingFeedback.getRating(),
                    "message", existingFeedback.getMessage(),
                    "submittedAt", existingFeedback.getCreatedAt()
                ) : null
            ));
            
        } catch (Exception e) {
            System.err.println("[FeedbackController] Error getting feedback status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get feedback status"));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateFeedback(
            @RequestBody Map<String, Object> feedbackData,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            Integer rating = (Integer) feedbackData.get("rating");
            String message = (String) feedbackData.get("message");
            
            if (rating == null || rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }
            
            UserFeedback updatedFeedback = feedbackService.updateFeedback(user, rating, message);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Feedback updated successfully!",
                "feedback", Map.of(
                    "rating", updatedFeedback.getRating(),
                    "message", updatedFeedback.getMessage(),
                    "updatedAt", updatedFeedback.getCreatedAt()
                )
            ));
            
        } catch (Exception e) {
            System.err.println("[FeedbackController] Error updating feedback: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
