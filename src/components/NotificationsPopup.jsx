import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './NotificationsPopup.css';

const NotificationsPopup = ({ show, onClose }) => {
    const { getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchNotifications();
        }
    }, [show]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/notifications?limit=10`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Erro ao marcar todas:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification.id);

        // Navegar baseado no tipo
        switch (notification.type) {
            case 'like':
            case 'comment':
                navigate('/');
                break;
            case 'follow':
                navigate(`/profile/${notification.fromUserId}`);
                break;
            case 'message':
                navigate('/chat');
                break;
            case 'new_post':
                navigate('/');
                break;
            default:
                break;
        }

        onClose();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'follow':
                return '👤';
            case 'message':
                return '✉️';
            case 'new_post':
                return '📝';
            default:
                return '🔔';
        }
    };

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'like':
                return `${notification.fromUserName} curtiu seu post`;
            case 'comment':
                return `${notification.fromUserName} comentou no seu post`;
            case 'follow':
                return `${notification.fromUserName} começou a seguir você`;
            case 'message':
                return `${notification.fromUserName} enviou uma mensagem`;
            case 'new_post':
                return `${notification.fromUserName} publicou um novo post`;
            default:
                return notification.message || 'Nova notificação';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    if (!show) return null;

    return (
        <>
            <div className="notifications-overlay" onClick={onClose} />
            <div className="notifications-popup card">
                <div className="notifications-header">
                    <h3>Notificações</h3>
                    {notifications.some(n => !n.read) && (
                        <button onClick={handleMarkAllAsRead} className="btn-text">
                            Marcar todas como lidas
                        </button>
                    )}
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="notifications-loading">
                            <div className="spinner"></div>
                            <p>Carregando...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notifications-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <p>Nenhuma notificação</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-text">{getNotificationText(notification)}</p>
                                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                </div>
                                {!notification.read && <div className="notification-dot"></div>}
                            </div>
                        ))
                    )}
                </div>

                <div className="notifications-footer">
                    <button onClick={() => { navigate('/notifications'); onClose(); }} className="btn-text">
                        Ver todas
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationsPopup;
