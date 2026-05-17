import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DUMMY_USER = {
  id: 1,
  name: 'Dr. Manish Kumar',
  email: 'manish@medivision.ai',
  role: 'Doctor',
  avatar: 'MK',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    // Dummy: accept any credentials
    await new Promise(r => setTimeout(r, 800));
    setUser(DUMMY_USER);
    setLoading(false);
    return { success: true };
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ ...DUMMY_USER, name, email });
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
