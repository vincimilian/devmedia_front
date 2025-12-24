import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import './Feed.css';

const Feed = () => {
    const { API_URL, getAuthHeaders } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/feed`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(post => post.id !== postId));
    };

    return (
        <div className="feed-page">
            <Navbar />

            <div className="container">
                <div className="feed-header">
                    <h1 className="feed-title">Feed</h1>
                    <p className="feed-subtitle">Veja o que os desenvolvedores estão compartilhando</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Carregando posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state card">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <h3>Nenhum post ainda</h3>
                        <p>Seja o primeiro a compartilhar algo!</p>
                    </div>
                ) : (
                    <div className="posts-container">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
