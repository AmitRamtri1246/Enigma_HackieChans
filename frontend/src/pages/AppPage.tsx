import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut } from 'lucide-react';

export const AppPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">TraceIQ</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome, {user?.full_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Authenticated successfully.
          </p>
        </div>
        
        <div className="pt-4 border-t border-border/60 space-y-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.id}</p>
          </div>
          
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
