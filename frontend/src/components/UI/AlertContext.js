import { createContext, useState } from 'react';

// Create the context
export const AlertContext = createContext();

// Create a provider component to wrap the app
export const AlertProvider = ({ children }) => {
  // State to hold alert properties: isOpen (visibility), status (e.g., 'success', 'error'), and message
  const [alert, setAlert] = useState({ isOpen: false, status: '', variant: '', title: '', message: '' });

  // Function to show the alert with a status and message
  const showAlert = (status, variant, title, message) => {
    setAlert({ isOpen: true, status, variant, title, message });
  };

  // Function to hide the alert
  const hideAlert = () => {
    setAlert({ isOpen: false, status: '', variant: '', title: '',message: '' });
  };

  // Provide the alert state and functions to the context
  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};