// Thin re-export: useAuth must NOT register its own onAuthStateChange
// listener. Every component that imported it created a fresh subscription
// (we counted 11+ identical "Auth state changed" logs per event), which
// triggered cascading re-renders that crashed Radix Dialogs with
// `Failed to execute 'removeChild' on 'Node'`. We now read from the single
// UnifiedAuthContext instance instead.
export { useAuthContext as useAuth } from '@/contexts/UnifiedAuthContext';
