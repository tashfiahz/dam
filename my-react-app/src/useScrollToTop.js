import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useScrollToTop = () => {
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useScrollToTop hook mounted');
    const handleScroll = () => {
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      console.log('Current Scroll Top:', currentScrollTop);
      if (currentScrollTop < lastScrollTop) {
        console.log('Navigating to homepage');
        navigate('/homepage');
      }
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop, navigate]);

  return null;
};

export default useScrollToTop;
