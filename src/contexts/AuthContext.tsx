/**
 * @deprecated Use UnifiedAuthContext instead
 * This file is kept for backward compatibility
 */
export { 
  useAuthContext,
  type UserRole,
  type UserProfile as User,
  type UserPermissions
} from './UnifiedAuthContext';

// Re-export the provider for backward compatibility (not needed if using UnifiedAuthProvider)
import { UnifiedAuthProvider } from './UnifiedAuthContext';
export const AuthProvider = UnifiedAuthProvider;
