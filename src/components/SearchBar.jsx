import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SearchBar.css';

const SearchBar = () => {
    const { getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [], tags: [] });
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ users: [], posts: [], tags: [] });
            setShowResults(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Erro ao buscar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        setShowResults(false);
        setQuery('');
    };

    const handlePostClick = (postId) => {
        navigate(`/`);
        setShowResults(false);
        setQuery('');
    };

    const handleTagClick = (tag) => {
        setQuery(`#${tag}`);
        handleSearch();
    };

    const totalResults = results.users.length + results.posts.length + results.tags.length;

    return (
        <div className="search-bar" ref={searchRef}>
            <div className="search-input-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar posts, usuários ou tags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                {loading && <div className="search-spinner"></div>}
            </div>

            {showResults && totalResults > 0 && (
                <div className="search-results">
                    {results.users.length > 0 && (
                        <div className="results-section">
                            <h4 className="results-title">Usuários</h4>
                            {results.users.map(user => (
                                <div
                                    key={user.id}
                                    className="result-item"
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=667eea&color=fff`}
                                        alt={user.displayName}
                                        className="result-avatar"
                                    />
                                    <div className="result-info">
                                        <div className="result-name">{user.displayName}</div>
                                        {user.bio && <div className="result-bio">{user.bio.substring(0, 50)}...</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.posts.length > 0 && (
                        <div className="results-section">
                            <h4 className="results-title">Posts</h4>
                            {results.posts.map(post => (
                                <div
                                    key={post.id}
                                    className="result-item"
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <div className="result-info">
                                        <div className="result-name">{post.userDisplayName}</div>
                                        <div className="result-content">{post.content.substring(0, 80)}...</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.tags.length > 0 && (
                        <div className="results-section">
                            <h4 className="results-title">Tags</h4>
                            {results.tags.map((tagData, index) => (
                                <div
                                    key={index}
                                    className="result-item"
                                    onClick={() => handleTagClick(tagData.tag)}
                                >
                                    <div className="result-info">
                                        <div className="result-tag">
                                            #{tagData.tag}
                                            <span className="tag-count">{tagData.count} posts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showResults && query.length >= 2 && totalResults === 0 && !loading && (
                <div className="search-results">
                    <div className="no-results">
                        <p>Nenhum resultado encontrado para "{query}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
