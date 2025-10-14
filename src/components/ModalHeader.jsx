import React from 'react';

const ModalHeader = ({heading,onClose}) => {
  return (
    <>
      <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-xl font-semibold text-blue-800">
            {heading}
          </h1>
          <button onClick={onClose} className=" hover:cursor-pointer text-gray-500 text-2xl hover:text-red-600">
            &times;
          </button>
        </div>
    </>
  );
};

export default ModalHeader;