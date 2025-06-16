
import React from 'react';

interface SimpleNotificationTestProps {
  onClose: () => void;
}

export const SimpleNotificationTest: React.FC<SimpleNotificationTestProps> = ({ onClose }) => {
  return (
    <div className="bg-white border-2 border-red-500 p-4 rounded shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">TEST NOTIFICATIONS</h3>
        <button 
          onClick={onClose}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        <div className="bg-blue-100 p-2 rounded">
          <p className="font-medium">Notification 1</p>
          <p className="text-sm text-gray-600">Ceci est un test</p>
        </div>
        <div className="bg-green-100 p-2 rounded">
          <p className="font-medium">Notification 2</p>
          <p className="text-sm text-gray-600">Test numéro 2</p>
        </div>
      </div>
    </div>
  );
};
