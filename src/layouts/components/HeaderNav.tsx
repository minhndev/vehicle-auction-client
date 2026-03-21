import React from 'react';
import { Link } from 'react-router-dom';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  isActive?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  { id: '1', label: 'Home', url: '/', isActive: true },
  { id: '2', label: 'Car Auction', url: '/auctions' },
  { id: '3', label: 'Sell Your Car', url: '/sell' },
  { id: '4', label: 'About us', url: '/about' },
  { id: '5', label: 'Contect', url: '/contact' },
];

const NavLink = ({ item }: { item: NavItem }) => {
  return (
    <div className="relative flex flex-col items-center">
      <Link 
        to={item.url}
        className={`text-white text-[16px] leading-[19.2px] hover:opacity-80 transition-opacity ${item.isActive ? 'font-bold' : 'font-medium'}`}
      >
        {item.label}
      </Link>
      {/* Active Indicator Underline */}
      {item.isActive && (
        <div className="absolute -bottom-[6px] w-[16px] h-[3px] bg-[#ffcb23] rounded-[5px]" />
      )}
    </div>
  );
};

export const HeaderNav: React.FC = () => {
  return (
    <div className="w-full h-[82px] bg-[#e8edfa] bg-opacity-20 flex items-center justify-center font-['Lato'] absolute top-0 left-0 z-50">
      <div className="w-full max-w-[1202px] flex items-center justify-between">
        
        {/* Logo */}
        <div className="w-[165px] h-[42px] bg-gray-300 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src="/placeholder.png" alt="Logo" className="w-[120px] opacity-50" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px] lg:gap-[40px] ml-[auto] mr-[auto]">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-[10px]">
          <Link 
            to="/login"
            className="text-white text-[16px] font-bold leading-[19.2px] hover:underline"
          >
            Sign in
          </Link>
          <span className="text-[#898989] text-[16px] font-medium leading-[19.2px]">or</span>
          <Link
            to="/register"
            className="flex items-center justify-center w-[122px] h-[35px] bg-[#2e3d83] rounded-[5px] text-white text-[16px] font-medium leading-[19.2px] hover:bg-opacity-90 transition-colors"
          >
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
};
