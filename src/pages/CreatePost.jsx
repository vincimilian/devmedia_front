import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import './CreatePost.css';

const CreatePost = () => {
    const { getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('A imagem deve ter no máximo 5MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('O conteúdo não pode estar vazio');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let imageUrl = null;

            // Upload da imagem se houver
            if (image) {
                const formData = new FormData();
                formData.append('image', image);

                const uploadResponse = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': getAuthHeaders().Authorization
                    },
                    body: formData
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    imageUrl = uploadData.url;
                }
            }

            // Criar post
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    content,
                    imageUrl,
                    tags: tagsArray
                })
            });

            const data = await response.json();

            if (data.success) {
                navigate('/');
            } else {
                setError('Erro ao criar post');
            }
        } catch (err) {
            setError('Erro ao criar post: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    return (
        <div className="create-post-page">
            <Navbar />

            <div className="container">
                <div className="create-post-container">
                    <div className="create-post-card card">
                        <h1 className="create-post-title">Criar Novo Post</h1>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="create-post-form">
                            <div className="form-group">
                                <label htmlFor="content">Conteúdo</label>
                                <textarea
                                    id="content"
                                    className="input"
                                    placeholder="Compartilhe algo interessante..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows="6"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (separadas por vírgula)</label>
                                <input
                                    id="tags"
                                    type="text"
                                    className="input"
                                    placeholder="javascript, react, nodejs"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Imagem (opcional)</label>
                                <div className="image-upload-container">
                                    {!imagePreview ? (
                                        <label htmlFor="image-upload" className="image-upload-label">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <span>Clique para adicionar uma imagem</span>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    ) : (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="btn-remove-image"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
