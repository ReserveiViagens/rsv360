// Componentes de Autenticação
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { AuthProvider, useAuth, useRole, useAnyRole } from './AuthProvider';
export { ProtectedRoute, useProtectedRoute, DefaultFallback } from './ProtectedRoute';
export {
  PermissionsProvider,
  usePermissions,
  PermissionGate,
  MultiPermissionGate,
  UserPermissionsInfo,
  ROLE_PERMISSIONS
} from './RoleBasedAccess';
export { UserProfile } from './UserProfile';
export { SessionManager } from './SessionManager';
export { UserManagement } from './UserManagement';
export { AdminPanel } from './AdminPanel';
export { AuditLog } from './AuditLog';

// Tipos
export type { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData 
} from './AuthProvider';

export type { 
  Permission, 
  UserRole 
} from './RoleBasedAccess';
