import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const ROLE_RANK: Record<string, number> = {
  Owner: 50,
  Admin: 40,
  Developer: 30,
  Analyst: 20,
  Viewer: 10,
  engineer: 30,
  admin: 40,
  viewer: 10,
};

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, fallback, children }) => {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.is_superuser) {
    return <>{children}</>;
  }

  const userRoleRank = ROLE_RANK[user.role] || 10;
  const isAllowed = allowedRoles.some((role) => {
    const requiredRank = ROLE_RANK[role] || 10;
    return userRoleRank >= requiredRank;
  });

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="glass-card p-6 rounded-2xl border border-rose-500/20 text-center space-y-3 font-sans">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 w-12 h-12 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">Access Restricted</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your role <span className="font-mono text-amber-400 font-bold">[{user.role}]</span> does not have sufficient RBAC permissions to access this feature. Required role: {allowedRoles.join(', ')}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
