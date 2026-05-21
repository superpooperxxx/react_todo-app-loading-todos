import { useCallback, useEffect, useState } from 'react';

export function useErrorMessage() {
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetErrorMessage = useCallback(() => {
    setErrorMessage('');
  }, []);

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      handleResetErrorMessage();
    }, 3000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [errorMessage, handleResetErrorMessage]);

  return {
    errorMessage,
    setErrorMessage,
    resetErrorMessage: handleResetErrorMessage,
  };
}
