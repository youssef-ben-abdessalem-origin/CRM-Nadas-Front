import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    toast.success("Logged out");
    navigate('/login', { replace: true });
  };
  return (
    <button onClick={logout} style={{ padding: '6px 12px', borderRadius: 4 }}>
      Logout
    </button>
  );
};
