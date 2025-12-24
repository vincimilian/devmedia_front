import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import NotificationsPopup from './NotificationsPopup';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout, getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchUnreadCount();
            // Atualizar a cada 30 segundos
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`${API_URL}/notifications/unread/count`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="navbar-brand">
                    <h2 className="brand-text">GitProj</h2>
                </Link>

                <SearchBar />

                <div className="navbar-menu">
                    <Link to="/" className="nav-link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </Link>

                    <Link to="/create" className="nav-link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Criar</span>
                    </Link>

                    <Link to="/chat" className="nav-link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </Link>

                    <div
                        className="nav-link notifications-link"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ cursor: 'pointer' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </div>
                </div>

                <div className="navbar-user">
                    {currentUser && (
                        <>
                            <div className="user-info" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                                <img
                                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email)}&background=667eea&color=fff`}
                                    alt={currentUser.displayName || currentUser.email}
                                    className="avatar avatar-sm"
                                />
                                <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                            </div >
                            <button onClick={handleLogout} className="btn btn-icon logout-btn" title="Sair">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </>
                    )}
                </div >
            </div >

            <NotificationsPopup
                show={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </nav >
    );
};

export default Navbar;
