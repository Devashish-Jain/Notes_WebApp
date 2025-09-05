import api from './axios';

// Authentication API
export const authAPI = {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (credentials) => api.post('/api/auth/login', credentials),
};

// Notes API
export const notesAPI = {
    getNotes: () => api.get('/api/notes'),
    createNote: (formData) => {
        return api.post('/api/notes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    updateNote: (id, noteData) => api.put(`/api/notes/${id}`, noteData),
    deleteNote: (id) => api.delete(`/api/notes/${id}`),
    createShareLink: (noteId, accessLevel) => 
        api.post(`/api/notes/${noteId}/share`, { accessLevel }),
    getNoteShareLinks: (noteId) => api.get(`/api/notes/${noteId}/shares`),
};

// Public API (no authentication required)
export const publicAPI = {
    getSharedNote: (shareId) => api.get(`/api/public/notes/${shareId}`),
    updateSharedNote: (shareId, noteData) => api.put(`/api/public/notes/${shareId}`, noteData),
};
