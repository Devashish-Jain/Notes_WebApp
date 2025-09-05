package com.notesapp.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    // Cloudinary storage implementation
    public List<String> storeFilesInCloudinary(MultipartFile[] files) throws Exception {
        if (cloudinary == null) {
            throw new RuntimeException("Cloudinary service is not configured properly");
        }
        
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            try {
                System.out.println("[FileStorageService] Uploading file: " + file.getOriginalFilename() + ", Size: " + file.getSize());
                
                // Upload to Cloudinary
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                    ObjectUtils.asMap(
                        "folder", "notes-app", // Organize in folders
                        "resource_type", "image",
                        "public_id", "note_image_" + UUID.randomUUID().toString(),
                        "overwrite", true,
                        "format", "jpg", // Convert all to jpg for consistency
                        "quality", "auto:good", // Automatic quality optimization
                        "fetch_format", "auto" // Automatic format optimization
                    ));
                
                System.out.println("[FileStorageService] Upload result: " + uploadResult);
                
                // Get the secure URL
                String imageUrl = (String) uploadResult.get("secure_url");
                if (imageUrl == null) {
                    throw new RuntimeException("Cloudinary upload succeeded but did not return a URL");
                }
                
                imageUrls.add(imageUrl);
                System.out.println("[FileStorageService] Successfully uploaded image: " + imageUrl);
                
            } catch (IOException e) {
                System.err.println("[FileStorageService] IOException during upload: " + e.getMessage());
                throw new RuntimeException("Failed to upload image to Cloudinary: " + e.getMessage());
            } catch (Exception e) {
                System.err.println("[FileStorageService] General exception during upload: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        }
        
        return imageUrls;
    }
    
    // Delete image from Cloudinary
    public void deleteImageFromCloudinary(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }
    
    // Extract public ID from Cloudinary URL
    public String extractPublicIdFromUrl(String cloudinaryUrl) {
        try {
            // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v123456/notes-app/note_image_uuid.jpg
            String[] parts = cloudinaryUrl.split("/");
            String fileNameWithExtension = parts[parts.length - 1];
            String fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
            return "notes-app/" + fileName; // Include folder path
        } catch (Exception e) {
            return null; // Return null if extraction fails
        }
    }
    
    // Legacy method for backward compatibility (now delegates to Cloudinary)
    public List<String> storeFilesInDatabase(MultipartFile[] files) throws Exception {
        return storeFilesInCloudinary(files);
    }
    
    private String getFileExtension(String filename) {
        if (filename == null) return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot != -1 ? filename.substring(lastDot) : ".jpg";
    }
}
