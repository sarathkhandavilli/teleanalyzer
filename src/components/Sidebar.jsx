import React, { useState } from 'react';
import LeftArrow from '../assets/leftarrow.png';
import RightArrow from '../assets/rightarrow.png';
import VeltrisLogo from '../assets/veltrislogo.png';
import Vlogo from '../assets/vlogoo.jpg';
import sidebarItems from '../data/sidebarItems';
import ItemButton from './ItemButton.jsx';

const Sidebar = ({ setItem, selectedItem }) => {
  
  const [isOpen, setIsOpen] = useState(true);

  const toggleSideMenu = () => setIsOpen((prev) => !prev);

  return (
    <div
      className={`
        relative bg-blue-900 h-screen text-white flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-56' : 'w-20'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSideMenu}
        className="absolute top-6 -right-3 z-10 hover:cursor-pointer bg-white p-1 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md"
      >
        {isOpen ? (
          <img src={LeftArrow} className="w-3 h-3 " alt="Collapse" />
        ) : (
          <img src={RightArrow} className="w-3 h-3" alt="Expand" />
        )}
      </button>

      {/* Logo Section */}
      <div className="flex items-center h-20 justify-center px-2">
        {isOpen ? (
          <img src={VeltrisLogo} alt="Veltris Logo" className="w-36 rounded-md transition-all" />
        ) : (
          <img src={Vlogo} alt="V Logo" className="w-8 h-8 rounded-md transition-all" />
        )}
      </div>

      {/* Divider */}
      <div className="px-4 my-1">
        <div className="border-t border-blue-700 w-full"></div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1  px-2 py-2 space-y-2">
        {sidebarItems.map((item) => (
          <ItemButton
            key={item.key}
            itemKey={item.key}
            itemName={item.name}
            imageName={item.icon}
            isSideMenuOpen={isOpen}
            isSelected={selectedItem === item.key}
            setItem={setItem}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
