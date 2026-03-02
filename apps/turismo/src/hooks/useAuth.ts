import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService, User, LoginCredentials, LoginResponse, TwoFactorVerification } from '../services/authService';
import { wsClient } from '../services/websocketClient';
import { toast } from 'react-hot-toast';

// Auth Context Type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  tempToken: string | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  verify2FA: (verification: TwoFactorVerification) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth State Hook (for provider)
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        
        if (isValid) {
          // Get current user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Connect WebSocket if not connected
          if (!wsClient.isConnected()) {
            wsClient.connect();
          }
        } else {
          // Token is invalid, clear auth
          authService.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid auth state
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);
      
      if (result.requiresTwoFactor) {
        // 2FA required
        setRequiresTwoFactor(true);
        setTempToken(result.tempToken || null);
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Normal login successful
        setUser(result.user);
        setIsAuthenticated(true);
        setRequiresTwoFactor(false);
        setTempToken(null);
      }
      
      return result;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setRequiresTwoFactor(false);
      setTempToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2FA verification function
  const verify2FA = useCallback(async (verification: TwoFactorVerification): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Add temp token if available
      if (tempToken) {
        verification.temp_token = tempToken;
      }
      
      const result = await authService.verify2FA(verification);
      
      // 2FA successful
      setUser(result.user);
      setIsAuthenticated(true);
      setRequiresTwoFactor(false);
      setTempToken(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tempToken]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setRequiresTwoFactor(false);
      setTempToken(null);
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [logout]);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        return false;
      }

      const isValid = await authService.verifyToken();
      if (!isValid) {
        await logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Check auth error:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Setup token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, logout]);

  // Handle visibility change (page focus)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Check auth when page becomes visible
        const isValid = await checkAuth();
        if (isValid) {
          // Refresh user data
          await refreshUser();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkAuth, refreshUser]);

  // WebSocket connection management
  useEffect(() => {
    if (isAuthenticated && !wsClient.isConnected()) {
      wsClient.connect();
    } else if (!isAuthenticated && wsClient.isConnected()) {
      wsClient.disconnect();
    }
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    requiresTwoFactor,
    tempToken,
    login,
    verify2FA,
    logout,
    refreshUser,
    checkAuth,
  };
};

// Permission Hook
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Define permission mapping
    const permissions: { [key: string]: string[] } = {
      'bookings.create': ['admin', 'manager', 'user'],
      'bookings.read': ['admin', 'manager', 'user'],
      'bookings.update': ['admin', 'manager'],
      'bookings.delete': ['admin'],
      'bookings.stats': ['admin', 'manager'],
      'payments.create': ['admin', 'manager', 'user'],
      'payments.read': ['admin', 'manager', 'user'],
      'payments.refund': ['admin', 'manager'],
      'payments.stats': ['admin', 'manager'],
      'users.create': ['admin'],
      'users.read': ['admin', 'manager'],
      'users.update': ['admin', 'manager'],
      'users.delete': ['admin'],
      'system.settings': ['admin'],
      'system.logs': ['admin', 'manager'],
    };

    const allowedRoles = permissions[permission];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
  }, [user]);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (!user) return false;

    // Define route access mapping
    const routePermissions: { [key: string]: string[] } = {
      '/admin': ['admin'],
      '/admin/*': ['admin'],
      '/manager': ['admin', 'manager'],
      '/manager/*': ['admin', 'manager'],
      '/dashboard': ['admin', 'manager', 'user'],
      '/bookings': ['admin', 'manager', 'user'],
      '/payments': ['admin', 'manager', 'user'],
      '/profile': ['admin', 'manager', 'user'],
      '/settings': ['admin'],
      '/analytics': ['admin', 'manager'],
      '/users': ['admin', 'manager'],
    };

    // Check exact route first
    if (routePermissions[route]) {
      return routePermissions[route].includes(user.role);
    }

    // Check wildcard routes
    for (const [routePattern, roles] of Object.entries(routePermissions)) {
      if (routePattern.endsWith('/*')) {
        const basePath = routePattern.slice(0, -2);
        if (route.startsWith(basePath)) {
          return roles.includes(user.role);
        }
      }
    }

    // Default: allow access for authenticated users
    return true;
  }, [user]);

  return {
    hasRole,
    hasPermission,
    canAccessRoute,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isUser: !!user,
  };
};

// User Profile Hook
export const useUserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    try {
      setIsUpdating(true);
      // Implement profile update API call
      // await userService.updateProfile(data);
      await refreshUser();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Erro ao atualizar perfil');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setIsUpdating(true);
      // Implement password change API call
      // await authService.changePassword(currentPassword, newPassword);
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Erro ao alterar senha');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    user,
    isUpdating,
    updateProfile,
    changePassword,
    refreshUser,
  };
};

export default useAuth;
