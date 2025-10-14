import React from 'react';

const ItemButton = ({ itemKey, itemName, imageName, isSideMenuOpen, isSelected, setItem }) => {
  return (
    <button
      className={`
        transition-all text-white flex p-2 rounded-md hover:cursor-pointer
        ${isSideMenuOpen ? 'w-full justify-start items-center' : 'w-full justify-center items-center'}
        hover:shadow-sm
        ${isSelected ? 'bg-gray-50/20' : 'hover:bg-gray-50/8'}
        whitespace-nowrap
      `} 
      title={!isSideMenuOpen ? itemName : ""}
      onClick={() => setItem(itemKey)}
    >
      <img
        src={imageName}
        className={`w-4 flex-shrink-0 transition-all duration-300 ${isSideMenuOpen ? 'mr-2' : ''}`}
        alt={itemName}
      />
      <span className={`text-sm transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap flex-shrink-0 ${isSideMenuOpen ? 'opacity-100 ' : 'opacity-0 max-w-0'}`}>
        {itemName}
      </span>
    </button>
  );
};

export default ItemButton;