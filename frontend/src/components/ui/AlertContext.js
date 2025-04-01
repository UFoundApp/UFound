import { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    status: '',
    variant: '',
    title: '',
    message: '',
    type: '',
    alertAction: null,
    alertOff: null,
  });

  // Function to show the alert and return a Promise
  const showAlert = (status, variant, title, message, type = 'none', alertAction = null, alertOff = null) => {
    return new Promise((resolve) => {
      setAlert({
        isOpen: true,
        status,
        variant,
        title,
        message,
        type,
        alertAction: () => {
          if (alertAction) alertAction(); // Execute the provided action
          resolve(true); // Resolve the Promise with true when action is taken
        },
        alertOff: () => {
          if (alertOff) alertOff(); // Execute the provided action
          resolve(false); // Resolve the Promise with false when action is taken
        },
      });
    });
  };

  // Function to hide the alert
  const hideAlert = () => {
    setAlert({
      isOpen: false,
      status: '',
      variant: '',
      title: '',
      message: '',
      type: '',
      alertAction: null,
      alertOff: null,
    });
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};