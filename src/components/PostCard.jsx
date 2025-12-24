import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';
import './PostCard.css';

const PostCard = ({ post, onDelete, onUpdate }) => {
    const { currentUser, getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?.uid));
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleUserClick = (userId) => {
        if (userId === currentUser?.uid) {
            navigate('/profile');
        } else {
            navigate(`/profile/${userId}`);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/${post.id}/like`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setIsLiked(data.liked);
                setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja deletar este post?')) return;

        try {
            const response = await fetch(`${API_URL}/posts/${post.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success && onDelete) {
                onDelete(post.id);
            }
        } catch (error) {
            console.error('Erro ao deletar post:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="post-card card fade-in">
            <div className="post-header">
                <div className="post-author" onClick={() => handleUserClick(post.userId)} style={{ cursor: 'pointer' }}>
                    <img
                        src={post.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userDisplayName)}&background=667eea&color=fff`}
                        alt={post.userDisplayName}
                        className="avatar"
                    />
                    <div className="author-info">
                        <h4 className="author-name">{post.userDisplayName}</h4>
                        <span className="post-time">{formatDate(post.createdAt)}</span>
                    </div>
                </div>

                {currentUser?.uid === post.userId && (
                    <button onClick={handleDelete} className="btn-delete" title="Deletar post">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="post-content">
                {post.content && <p>{post.content}</p>}

                {/* Post compartilhado */}
                {post.sharedFrom && (
                    <div className="shared-post">
                        <div className="shared-header" onClick={() => handleUserClick(post.sharedFrom.userId)} style={{ cursor: 'pointer' }}>
                            <img
                                src={post.sharedFrom.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.sharedFrom.userDisplayName)}&background=667eea&color=fff`}
                                alt={post.sharedFrom.userDisplayName}
                                className="avatar avatar-sm"
                            />
                            <span className="shared-author">{post.sharedFrom.userDisplayName}</span>
                        </div>
                        <p className="shared-content">{post.sharedFrom.content}</p>
                        {post.sharedFrom.imageUrl && (
                            <div className="shared-image-container">
                                <img src={post.sharedFrom.imageUrl} alt="Shared" className="shared-image" />
                            </div>
                        )}
                        {post.sharedFrom.tags && post.sharedFrom.tags.length > 0 && (
                            <div className="post-tags">
                                {post.sharedFrom.tags.map((tag, index) => (
                                    <span key={index} className="badge badge-primary">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!post.sharedFrom && post.imageUrl && (
                    <div className="post-image-container">
                        <img src={post.imageUrl} alt="Post" className="post-image" />
                    </div>
                )}

                {!post.sharedFrom && post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="badge badge-primary">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="post-actions">
                <button
                    onClick={handleLike}
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{likesCount}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="action-btn"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{commentsCount}</span>
                </button>

                <button
                    onClick={() => setShowShareModal(true)}
                    className="action-btn"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    {post.sharesCount > 0 && <span>{post.sharesCount}</span>}
                </button>
            </div>

            {showComments && (
                <CommentSection
                    postId={post.id}
                    onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                    onCommentDeleted={() => setCommentsCount(prev => Math.max(0, prev - 1))}
                />
            )}

            {showShareModal && (
                <ShareModal
                    post={post}
                    onClose={(shared) => {
                        setShowShareModal(false);
                        if (shared && onUpdate) {
                            onUpdate();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default PostCard;
