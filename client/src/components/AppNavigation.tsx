import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, MessageCircle, Image, Eye } from 'lucide-react';

const AppNavigation: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 border-t border-blue-700 py-3 px-4 z-50 shadow-lg">
      <div className="max-w-screen-md mx-auto flex justify-around items-center">
        <NavItem 
          to="/"
          icon={<Home />}
          label="Home"
          isActive={location === '/'}
        />
        <NavItem 
          to="/"
          icon={<MessageCircle />}
          label="Chat"
          isActive={location === '/'}
        />
        <NavItem 
          to="/upload"
          icon={<Image />}
          label="Images"
          isActive={location === '/upload'}
        />
        <NavItem 
          to="/generating-website"
          icon={<Eye />}
          label="Generate"
          isActive={location === '/generating-website'}
        />
      </div>
    </div>
  );
};

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link href={to}>
      <div className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
        isActive 
          ? 'text-white font-medium' 
          : 'text-blue-100 hover:text-white'
      }`}>
        <div className="w-6 h-6 mb-1">
          {icon}
        </div>
        <span className="text-xs">{label}</span>
      </div>
    </Link>
  );
};

export default AppNavigation;