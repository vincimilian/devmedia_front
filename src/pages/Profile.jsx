import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import AvatarUpload from '../components/AvatarUpload';
import './Profile.css';

const Profile = () => {
    const { currentUser, getAuthHeaders, API_URL } = useAuth();
    const { userId } = useParams(); // Pegar userId da URL
    const profileUserId = userId || currentUser?.uid; // Se não tiver userId na URL, usar o do usuário logado
    const isOwnProfile = !userId || userId === currentUser?.uid;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        skills: [], // Changed from '' to []
        github: '',
        linkedin: '',
        website: ''
    });

    useEffect(() => {
        fetchProfile();
        fetchPosts(); // Renamed from fetchUserPosts
    }, [profileUserId]); // Recarregar quando mudar o userId

    const fetchProfile = async () => {
        try {
            const endpoint = isOwnProfile ? '/auth/me' : `/auth/profile/${profileUserId}`;
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setProfile(data);
            setFormData({
                displayName: data.displayName || '',
                bio: data.bio || '',
                skills: data.skills?.join(', ') || '',
                github: data.github || '',
                linkedin: data.linkedin || '',
                website: data.website || ''
            });
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => { // Renamed from fetchUserPosts
        if (!profileUserId) return; // Use profileUserId here

        try {
            const response = await fetch(`${API_URL}/posts/user/${profileUserId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...formData,
                    skills: skillsArray
                })
            });

            const data = await response.json();

            if (data.success) {
                setProfile(data.profile);
                setEditing(false);
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(post => post.id !== postId));
    };

    if (loading) {
        return (
            <div className="profile-page">
                <Navbar />
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Carregando perfil...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />

            <div className="container">
                <div className="profile-container">
                    <div className="profile-card card">
                        <div className="profile-header">
                            {editing ? (
                                <AvatarUpload
                                    currentAvatar={profile?.avatar}
                                    onUploadSuccess={(url) => {
                                        setProfile({ ...profile, avatar: url });
                                    }}
                                />
                            ) : (
                                <img
                                    src={profile?.avatar || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'User')}&background=667eea&color=fff&size=120`}
                                    alt={profile?.displayName}
                                    className="avatar avatar-xl"
                                />
                            )}
                            <div className="profile-info">
                                <h1 className="profile-name">{profile?.displayName}</h1>
                                <p className="profile-email">{profile?.email}</p>
                                <div className="profile-stats">
                                    <span><strong>{profile?.followersCount || 0}</strong> seguidores</span>
                                    <span><strong>{profile?.followingCount || 0}</strong> seguindo</span>
                                    <span><strong>{posts.length}</strong> posts</span>
                                </div>
                            </div>
                            <div className="profile-actions">
                                <FollowButton userId={profileUserId} />
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className="btn btn-secondary"
                                    >
                                        {editing ? 'Cancelar' : 'Editar Perfil'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-group">
                                    <label>Nome de exibição</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        className="input"
                                        rows="3"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Conte um pouco sobre você..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Skills (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        placeholder="JavaScript, React, Node.js"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>GitHub</label>
                                    <input
                                        type="url"
                                        className="input"
                                        value={formData.github}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>LinkedIn</label>
                                    <input
                                        type="url"
                                        className="input"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        className="input"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    Salvar Alterações
                                </button>
                            </form>
                        ) : (
                            <div className="profile-details">
                                {profile?.bio && (
                                    <div className="profile-section">
                                        <h3>Bio</h3>
                                        <p>{profile.bio}</p>
                                    </div>
                                )}

                                {profile?.skills && profile.skills.length > 0 && (
                                    <div className="profile-section">
                                        <h3>Skills</h3>
                                        <div className="skills-list">
                                            {profile.skills.map((skill, index) => (
                                                <span key={index} className="badge badge-primary">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(profile?.github || profile?.linkedin || profile?.website) && (
                                    <div className="profile-section">
                                        <h3>Links</h3>
                                        <div className="links-list">
                                            {profile.github && (
                                                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="profile-link">
                                                    GitHub
                                                </a>
                                            )}
                                            {profile.linkedin && (
                                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="profile-link">
                                                    LinkedIn
                                                </a>
                                            )}
                                            {profile.website && (
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-link">
                                                    Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-posts">
                        <h2 className="posts-title">Meus Posts ({posts.length})</h2>
                        {posts.length === 0 ? (
                            <div className="empty-state card">
                                <p>Você ainda não criou nenhum post</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onDelete={handleDeletePost}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
