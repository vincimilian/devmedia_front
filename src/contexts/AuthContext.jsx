import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                const token = await user.getIdToken();
                setUserToken(token);

                // Criar/atualizar perfil no backend
                try {
                    // Primeiro, buscar o perfil existente
                    const profileResponse = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const existingProfile = profileResponse.ok ? await profileResponse.json() : null;

                    // Só atualizar o avatar se o usuário não tiver um avatar customizado
                    const shouldUpdateAvatar = !existingProfile?.avatar || existingProfile.avatar === '';

                    await fetch(`${API_URL}/auth/profile`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            displayName: user.displayName || user.email,
                            // Só enviar photoURL se não houver avatar customizado
                            avatar: shouldUpdateAvatar ? (user.photoURL || '') : existingProfile.avatar
                        })
                    });
                } catch (error) {
                    console.error('Erro ao sincronizar perfil:', error);
                }
            } else {
                setUserToken(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };

    const getAuthHeaders = () => {
        if (!userToken) return {};
        return {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        };
    };

    const value = {
        currentUser,
        userToken,
        signup,
        login,
        loginWithGoogle,
        logout,
        getAuthHeaders,
        API_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
