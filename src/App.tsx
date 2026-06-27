import React, { useEffect, useState } from 'react';
import StudentPortal from './pages/StudentPortal';
import AdminSetup from './pages/AdminSetup';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (path.startsWith('/admin')) {
    return <AdminSetup />;
  }

  return <StudentPortal />;
}
