import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './FollowButton.css';

const FollowButton = ({ userId, initialFollowing = false }) => {
    const { currentUser, getAuthHeaders, API_URL } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkFollowStatus();
    }, [userId]);

    const checkFollowStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/follow/check/${userId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setIsFollowing(data.isFollowing);
        } catch (error) {
            console.error('Erro ao verificar status de seguir:', error);
        }
    };

    const handleFollow = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const response = await fetch(`${API_URL}/follow/${userId}`, {
                method,
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setIsFollowing(!isFollowing);
            }
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.uid === userId) {
        return null;
    }

    return (
        <button
            onClick={handleFollow}
            className={`btn follow-btn ${isFollowing ? 'following' : 'not-following'}`}
            disabled={loading}
        >
            {loading ? 'Carregando...' : (isFollowing ? 'Seguindo' : 'Seguir')}
        </button>
    );
};

export default FollowButton;
