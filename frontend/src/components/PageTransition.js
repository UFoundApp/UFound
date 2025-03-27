import { motion } from 'framer-motion';
import { Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

const PageTransition = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    // When children change, keep the old content visible
    setIsReady(false);
    
    // Small delay to ensure new content is ready
    const timer = setTimeout(() => {
      setContent(children);
      setIsReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [children]);

  return (
    <Box
      as={motion.div}
      initial={false}
      animate={{
        opacity: isReady ? 1 : 0.5,
        y: isReady ? 0 : 20,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      {content || children}
    </Box>
  );
};

export default PageTransition; 