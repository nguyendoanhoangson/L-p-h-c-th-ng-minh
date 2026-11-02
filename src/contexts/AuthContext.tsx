import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Student } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  // Parent multi-child state
  activeChildId: string | null;
  setActiveChildId: (id: string) => void;
  parentChildren: Student[];
  refreshData: () => void;
  // Gmail login modal state & methods
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  allUsers: User[];
  loginWithUser: (user: User) => void;
  loginWithEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('TEACHER');
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [activeChildId, setActiveChildId] = useState<string | null>('stu-101');
  const [parentChildren, setParentChildren] = useState<Student[]>([]);
  // Open Gmail login modal by default when starting the program
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);
  const [allUsers] = useState<User[]>(DEMO_USERS);

  const refreshData = () => {
    // For Parent role, find all children linked to this parent (fatherOrMotherName = Tran Van Binh)
    const allStudents = storageService.getStudents();
    const childrenList = allStudents.filter(
      (s) => s.parent.fatherOrMotherName.includes('Trần Văn Bình') || s.parent.phone === '0903456789'
    );
    setParentChildren(childrenList);
    if (childrenList.length > 0 && !activeChildId) {
      setActiveChildId(childrenList[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const matched = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matched);
    if (role === 'PARENT') {
      refreshData();
    }
  };

  const loginWithUser = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsLoginModalOpen(false);
    if (user.role === 'PARENT') {
      refreshData();
    }
  };

  const loginWithEmail = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === trimmed);
    if (matched) {
      loginWithUser(matched);
      return true;
    }
    // If not found in demo, create or fallback to teacher with this custom Gmail
    const customUser: User = {
      id: `usr-custom-${Date.now()}`,
      name: email.split('@')[0],
      email: trimmed,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '0912345678',
      schoolId: 'sch-01',
    };
    loginWithUser(customUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        activeChildId,
        setActiveChildId,
        parentChildren,
        refreshData,
        isLoginModalOpen,
        setIsLoginModalOpen,
        allUsers,
        loginWithUser,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
