import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Chat.css';

const Chat = () => {
    const { currentUser, getAuthHeaders, API_URL } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.userId);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            container.scrollTop = container.scrollHeight;
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${API_URL}/messages/conversations`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setConversations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            setConversations([]);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            setMessages([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    recipientId: selectedUser.userId,
                    content: newMessage,
                    type: 'text'
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (message) => {
        if (message.type === 'shared_post' && message.postData) {
            return (
                <div className="shared-post-message">
                    {message.content && message.content !== 'Compartilhou um post com você' && (
                        <p className="message-text">{message.content}</p>
                    )}
                    <div className="shared-post-card" onClick={() => navigate('/')}>
                        <div className="shared-post-header">
                            <img
                                src={message.postData.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.postData.userDisplayName)}&background=667eea&color=fff`}
                                alt={message.postData.userDisplayName}
                                className="avatar avatar-xs"
                            />
                            <span>{message.postData.userDisplayName}</span>
                        </div>
                        <p className="shared-post-content">{message.postData.content.substring(0, 100)}{message.postData.content.length > 100 ? '...' : ''}</p>
                        {message.postData.imageUrl && (
                            <img src={message.postData.imageUrl} alt="Post" className="shared-post-image" />
                        )}
                        {message.postData.tags && message.postData.tags.length > 0 && (
                            <div className="shared-post-tags">
                                {message.postData.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="tag">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return <p>{message.content}</p>;
    };

    return (
        <div className="chat-page">
            <Navbar />

            <div className="container">
                <div className="chat-container">
                    <div className="chat-sidebar">
                        <h2 className="chat-title">Mensagens</h2>
                        <div className="conversations-list">
                            {conversations.length === 0 ? (
                                <div className="empty-conversations">
                                    <p>Nenhuma conversa ainda</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.userId}
                                        className={`conversation-item ${selectedUser?.userId === conv.userId ? 'active' : ''}`}
                                        onClick={() => setSelectedUser(conv)}
                                    >
                                        <img
                                            src={conv.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.userName)}&background=667eea&color=fff`}
                                            alt={conv.userName}
                                            className="avatar avatar-sm"
                                        />
                                        <div className="conversation-info">
                                            <h4>{conv.userName}</h4>
                                            <p>{conv.lastMessage.substring(0, 30)}{conv.lastMessage.length > 30 ? '...' : ''}</p>
                                        </div>
                                        {conv.unread && <div className="unread-badge"></div>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="chat-main">
                        {selectedUser ? (
                            <>
                                <div className="chat-header">
                                    <img
                                        src={selectedUser.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.userName)}&background=667eea&color=fff`}
                                        alt={selectedUser.userName}
                                        className="avatar avatar-sm"
                                    />
                                    <h3>{selectedUser.userName}</h3>
                                </div>

                                <div className="messages-container">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-bubble">
                                                {renderMessage(message)}
                                                <span className="message-time">
                                                    {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="message-input-form">
                                    <input
                                        type="text"
                                        className="input message-input"
                                        placeholder="Digite uma mensagem..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-send"
                                        disabled={loading || !newMessage.trim()}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <h3>Selecione uma conversa</h3>
                                <p>Escolha uma conversa para começar a enviar mensagens</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
