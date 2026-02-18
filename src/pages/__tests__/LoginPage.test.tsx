import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContextModule from '../../context/AuthContext';
import * as RouterModule from 'react-router-dom';

// Setup Mocks
const mockLogin = vi.fn();
const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

// Spy on the actual modules
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => mockUseAuth(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock return
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: '',
            clearAuthExpiredMessage: vi.fn(),
        });
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    it('__前端元素__渲染登入表單基本元素', () => {
        renderComponent();
        // use regex with ^$ for strict full match
        expect(screen.getByLabelText(/^電子郵件$/)).toBeInTheDocument();
        expect(screen.getByLabelText(/^密碼$/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /登入/i })).toBeInTheDocument();
        const toggleBtn = screen.getByRole('button', { name: /隱藏密碼|顯示密碼/i });
        expect(toggleBtn).toBeInTheDocument();
    });

    it('__前端互動__切換密碼顯示狀態', async () => {
        renderComponent();
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText(/^密碼$/);
        const toggleBtn = screen.getByRole('button', { name: /顯示密碼/i });

        expect(passwordInput).toHaveAttribute('type', 'password');

        await user.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('__function 邏輯__驗證無效 Email 格式', async () => {
        renderComponent();
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText(/^電子郵件$/);
        const loginBtn = screen.getByRole('button', { name: /登入/i });

        await user.type(emailInput, 'invalid-email');
        await user.click(loginBtn);

        expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('__function 邏輯__驗證密碼強度不足', async () => {
        renderComponent();
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText(/^電子郵件$/);
        const passwordInput = screen.getByLabelText(/^密碼$/);
        const loginBtn = screen.getByRole('button', { name: /登入/i });

        await user.type(emailInput, 'valid@example.com');
        await user.type(passwordInput, 'web123'); // < 8 chars
        await user.click(loginBtn);
        expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();

        await user.clear(passwordInput);
        await user.type(passwordInput, '12345678'); // No letters
        await user.click(loginBtn);
        expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('__Mock API__登入成功導轉', async () => {
        // Setup successful login mock
        mockLogin.mockResolvedValue({});

        // Render
        const { rerender } = renderComponent();
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/^電子郵件$/);
        const passwordInput = screen.getByLabelText(/^密碼$/);
        const loginBtn = screen.getByRole('button', { name: /登入/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(loginBtn);

        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');

        // Verify navigation happens ONLY when isAuthenticated becomes true
        // Manually simulate the state change that would happen in a real provider
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: true,
            authExpiredMessage: '',
            clearAuthExpiredMessage: vi.fn(),
        });

        // Re-render to trigger useEffect
        rerender(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('__Mock API__登入失敗顯示錯誤', async () => {
        renderComponent();
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText(/^電子郵件$/);
        const passwordInput = screen.getByLabelText(/^密碼$/);
        const loginBtn = screen.getByRole('button', { name: /登入/i });

        const errorMessage = '帳號或密碼錯誤';
        mockLogin.mockRejectedValueOnce({
            response: { data: { message: errorMessage } }
        });

        await user.type(emailInput, 'wrong@example.com');
        await user.type(passwordInput, 'wrongpass123');
        await user.click(loginBtn);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('__前端互動__登入中狀態鎖定', async () => {
        renderComponent();
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText(/^電子郵件$/);
        const passwordInput = screen.getByLabelText(/^密碼$/);
        const loginBtn = screen.getByRole('button', { name: /登入/i });

        mockLogin.mockImplementation(() => new Promise(() => { })); // Hang

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(loginBtn);

        expect(await screen.findByText(/登入中.../i)).toBeInTheDocument();
        expect(loginBtn).toBeDisabled();
        expect(emailInput).toBeDisabled();
    });

    it('__function 邏輯__已登入狀態自動導轉', () => {
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: true,
            authExpiredMessage: '',
            clearAuthExpiredMessage: vi.fn(),
        });

        renderComponent();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
});
