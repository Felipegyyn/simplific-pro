import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Tenta ler do localStorage primeiro
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Caso não exista, retorna 'dark' como padrão inicial
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove qualquer classe de tema antiga
    root.classList.remove('light', 'dark');
    // Adiciona a classe correspondente ao tema atual
    root.classList.add(theme);
    // Salva no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};