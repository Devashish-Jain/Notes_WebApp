package com.notesapp.backend.controllers;

import com.notesapp.backend.entities.NoteImage;
import com.notesapp.backend.repositories.NoteImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private NoteImageRepository noteImageRepository;

    @GetMapping("/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {
        try {
            NoteImage noteImage = noteImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(noteImage.getImageType()));
            headers.setContentLength(noteImage.getImageData().length);
            headers.set("Content-Disposition", "inline; filename=\"" + noteImage.getImageName() + "\"");

            return new ResponseEntity<>(noteImage.getImageData(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
