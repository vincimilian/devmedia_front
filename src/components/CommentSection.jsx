import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './CommentSection.css';

const CommentSection = ({ postId, onCommentAdded, onCommentDeleted }) => {
    const { currentUser, getAuthHeaders, API_URL } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_URL}/comments/post/${postId}`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    postId,
                    content: newComment
                })
            });

            const data = await response.json();

            if (data.success) {
                setComments([...comments, data.comment]);
                setNewComment('');
                if (onCommentAdded) onCommentAdded();
            }
        } catch (error) {
            console.error('Erro ao criar comentário:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setComments(comments.filter(c => c.id !== commentId));
                if (onCommentDeleted) onCommentDeleted();
            }
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="comment-section">
            <form onSubmit={handleSubmit} className="comment-form">
                <input
                    type="text"
                    className="input comment-input"
                    placeholder="Escreva um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary btn-comment"
                    disabled={loading || !newComment.trim()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>

            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                        <img
                            src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userDisplayName)}&background=667eea&color=fff`}
                            alt={comment.userDisplayName}
                            className="avatar avatar-sm"
                        />
                        <div className="comment-content">
                            <div className="comment-header">
                                <span className="comment-author">{comment.userDisplayName}</span>
                                <span className="comment-time">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                        </div>
                        {currentUser?.uid === comment.userId && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="btn-delete-comment"
                                title="Deletar comentário"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
