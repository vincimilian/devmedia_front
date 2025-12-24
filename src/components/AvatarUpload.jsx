import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onUploadSuccess }) => {
    const { getAuthHeaders, API_URL } = useAuth();
    const [preview, setPreview] = useState(currentAvatar);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Apenas imagens são permitidas');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_URL}/upload/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeaders().Authorization
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setPreview(data.url);
                if (onUploadSuccess) {
                    onUploadSuccess(data.url);
                }
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="avatar-upload">
            <div className="avatar-preview">
                <img
                    src={preview || `https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=120`}
                    alt="Avatar"
                    className="avatar avatar-xl"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-change-avatar"
                    disabled={uploading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    {uploading ? 'Enviando...' : 'Trocar Foto'}
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default AvatarUpload;
