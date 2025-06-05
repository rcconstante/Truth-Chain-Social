import React from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavigationSection = (): JSX.Element => {
  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems: NavItem[] = [
    { label: "Features", path: "/#features", onClick: handleFeatureClick },
    { label: "How it Works", path: "/how-it-works" },
    { label: "Community", path: "/community" },
    { label: "Docs", path: "/docs" }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          onClick={item.onClick}
          className="text-white hover:text-gray-300 transition-colors font-medium"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};