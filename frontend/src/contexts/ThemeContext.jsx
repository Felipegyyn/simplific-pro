import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Forçamos 'dark' independentemente do que estiver no localStorage
  const [theme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    // Garantimos que apenas a classe 'dark' esteja presente no HTML
    root.classList.remove('light');
    root.classList.add('dark');
    // Forçamos o salvamento como 'dark' para evitar inconsistências
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Modo light temporariamente desativado para correções visuais
    console.log("Modo light temporariamente desativado.");
  };

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};