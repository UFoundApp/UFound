import { Alert, CloseButton } from "@chakra-ui/react"

import { useState, useEffect } from "react";

import { useContext } from 'react';
import { AlertContext } from './AlertContext';

const AlertComponent = () => {

  // Access the alert state and hide function from the context
  const { alert, hideAlert } = useContext(AlertContext);


  useEffect(() => {
    setTimeout(() => {
      hideAlert();
    }
    , 3500);
  }, [alert.isOpen]);

  
  // If the alert is not open, render nothing
  if (!alert.isOpen) return null;


  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] md:w-1/2">
      <Alert.Root  status={alert.status} variant={alert.variant} top={2}  maxWidth={700} mx="auto">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{alert.title}</Alert.Title>
          <Alert.Description> 
            {alert.message}
          </Alert.Description>
        </Alert.Content>
        <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={hideAlert} />
      </Alert.Root>
    </div>
  );
};

export default AlertComponent;