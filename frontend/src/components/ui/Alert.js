import { useContext, useEffect } from 'react';
import { AlertContext } from './AlertContext';
import { Alert, CloseButton, Spinner, Button } from '@chakra-ui/react';

const AlertComponent = () => {
  const { alert, hideAlert } = useContext(AlertContext);

  useEffect(() => {
    if (alert.type !== 'popup') {
      const timer = setTimeout(() => {
        hideAlert();
      }, 3500);
      return () => clearTimeout(timer); // Cleanup timeout on unmount or change
    }
  }, [alert.isOpen, alert.type, hideAlert]);

  if (!alert.isOpen) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] md:w-1/2">
      <Alert.Root status={alert.status} variant={alert.variant} top={2} maxWidth={700} mx="auto">
        <Alert.Indicator>
          {alert.type === 'popup' ? <Spinner size="sm" /> : null}
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>{alert.title}</Alert.Title>
          <Alert.Description>{alert.message}</Alert.Description>
          {alert.type == "popup" ?
            <Button marginTop={4} variant="surface" size="sm" colorPalette={'orange'} maxW={100} onClick={() => {
              alert.alertAction();
              hideAlert();
            }}>
              Yes
            </Button>
            : null}
        </Alert.Content>
        <CloseButton pos="relative" top="-2" insetEnd="-2" onClick={() => 
          {
            alert.alertOff();
            hideAlert();
          }
        } />
      </Alert.Root>
    </div>
  );
};

export default AlertComponent;
