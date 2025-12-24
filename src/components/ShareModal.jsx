import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ShareModal.css';

const ShareModal = ({ post, onClose }) => {
    const { getAuthHeaders, API_URL, currentUser } = useAuth();
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showUserSelect, setShowUserSelect] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [followedUsers, setFollowedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (showUserSelect) {
            fetchUsers();
            fetchFollowing();
        }
    }, [showUserSelect]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/users`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setAllUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await fetch(`${API_URL}/follow/following/${currentUser.uid}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            const followingIds = data.map(f => f.followingId);
            setFollowedUsers(followingIds);
        } catch (error) {
            console.error('Erro ao buscar seguindo:', error);
        }
    };

    // Filtrar e organizar usuários
    const getFilteredUsers = () => {
        let filtered = allUsers;

        // Se NÃO está buscando, mostrar apenas seguidos
        if (!userSearch.trim()) {
            return allUsers.filter(user => followedUsers.includes(user.id));
        }

        // Se está buscando, buscar em TODOS os usuários
        const search = userSearch.toLowerCase();
        filtered = filtered.filter(user =>
            user.displayName.toLowerCase().includes(search)
        );

        // Separar seguidos e não seguidos
        const followed = filtered.filter(user => followedUsers.includes(user.id));
        const others = filtered.filter(user => !followedUsers.includes(user.id));

        // Retornar seguidos primeiro
        return [...followed, ...others];
    };

    const filteredUsers = getFilteredUsers();

    const handleShare = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/posts/${post.id}/share`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ comment })
            });

            const data = await response.json();

            if (data.success) {
                onClose(true); // true indica que foi compartilhado
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendToUser = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            const message = {
                recipientId: selectedUser,
                content: comment || 'Compartilhou um post com você',
                type: 'shared_post',
                postData: {
                    id: post.id,
                    content: post.content,
                    userDisplayName: post.userDisplayName,
                    userAvatar: post.userAvatar,
                    imageUrl: post.imageUrl,
                    tags: post.tags
                }
            };

            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(message)
            });

            const data = await response.json();

            if (data.success) {
                onClose(true);
            }
        } catch (error) {
            console.error('Erro ao enviar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Compartilhar Post</h2>
                    <button onClick={onClose} className="btn-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="share-preview">
                        <div className="preview-author">
                            <img
                                src={post.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userDisplayName)}&background=667eea&color=fff`}
                                alt={post.userDisplayName}
                                className="avatar avatar-sm"
                            />
                            <span>{post.userDisplayName}</span>
                        </div>
                        <p className="preview-content">{post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
                    </div>

                    <div className="share-options">
                        <button onClick={handleCopyLink} className="btn btn-secondary share-option">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {copied ? 'Link Copiado!' : 'Copiar Link'}
                        </button>

                        <button
                            onClick={() => setShowUserSelect(!showUserSelect)}
                            className="btn btn-secondary share-option"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Enviar para Usuário
                        </button>

                        {showUserSelect && (
                            <div className="user-select-container">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="🔍 Buscar usuário..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />

                                <div className="users-list">
                                    {filteredUsers.length === 0 ? (
                                        <p className="no-users">Nenhum usuário encontrado</p>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className={`user-item ${selectedUser === user.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedUser(user.id)}
                                            >
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=667eea&color=fff`}
                                                    alt={user.displayName}
                                                    className="avatar avatar-sm"
                                                />
                                                <span className="user-name">
                                                    {user.displayName}
                                                    {followedUsers.includes(user.id) && (
                                                        <span className="following-badge">Seguindo</span>
                                                    )}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedUser && (
                                    <textarea
                                        className="input"
                                        placeholder="Mensagem opcional..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="2"
                                    />
                                )}
                                <button
                                    onClick={handleSendToUser}
                                    className="btn btn-primary"
                                    disabled={loading || !selectedUser}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Mensagem'}
                                </button>
                            </div>
                        )}

                        <div className="share-network">
                            <textarea
                                className="input"
                                placeholder="Adicione um comentário (opcional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="3"
                            />
                            <button
                                onClick={handleShare}
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Compartilhando...' : 'Compartilhar na Rede'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
