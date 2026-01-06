/**
 * @deprecated Use UnifiedAuthContext instead
 * This file is kept for backward compatibility
 */
export { 
  useUser,
  type UserRole,
  type UserProfile as User,
  type UserPermissions
} from './UnifiedAuthContext';

// Re-export types for backward compatibility
import { UnifiedAuthProvider } from './UnifiedAuthContext';
export const UserProvider = UnifiedAuthProvider;
