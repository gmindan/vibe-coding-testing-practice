import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';



export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, authExpiredMessage, clearAuthExpiredMessage } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            // 登入成功後，統一導向到 /dashboard
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (authExpiredMessage) {
            setApiError(authExpiredMessage);
            clearAuthExpiredMessage();
        }
    }, [authExpiredMessage, clearAuthExpiredMessage]);

    const validateForm = (): boolean => {
        let isValid = true;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('請輸入有效的 Email 格式');
            isValid = false;
        } else {
            setEmailError('');
        }

        // Password validation
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 8) {
            setPasswordError('密碼必須至少 8 個字元');
            isValid = false;
        } else if (!hasLetter || !hasNumber) {
            setPasswordError('密碼必須包含英文字母和數字');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            // Navigation handled by useEffect when isAuthenticated becomes true
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const message = axiosError.response?.data?.message || '登入失敗，請稍後再試';
            setApiError(message);
            setIsLoading(false); // Only set loading false on error, success redirects
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-icon">🔐</div>
                    <h1>歡迎回來</h1>
                    <p>請登入以繼續</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {apiError && (
                        <div className="error-banner" role="alert">
                            <span className="error-icon">⚠️</span>
                            {apiError}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">電子郵件</label>
                        <input
                            type="text"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className={emailError ? 'error' : ''}
                            autoComplete="email"
                        />
                        {emailError && <span className="field-error">{emailError}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密碼</label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="至少 8 個字元，需包含英數"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className={passwordError ? 'error' : ''}
                                autoComplete="current-password"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2em'
                                }}
                                aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                        {passwordError && <span className="field-error">{passwordError}</span>}
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="button-spinner" />
                                登入中...
                            </>
                        ) : (
                            '登入'
                        )}
                    </button>
                </form>

                {!import.meta.env.VITE_API_URL && (
                    <div className="login-footer">
                        <p>測試帳號：任意 email 格式 / 密碼需包含英數且8位以上</p>
                    </div>
                )}
            </div>
        </div>
    );
};
