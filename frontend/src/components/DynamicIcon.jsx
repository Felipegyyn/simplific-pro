// src/components/DynamicIcon.jsx

import React from 'react';
import { icons } from 'lucide-react';

const DynamicIcon = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Retorna um ícone padrão caso o nome seja inválido
    return <icons.HelpCircle {...props} />;
  }

  return <LucideIcon {...props} />;
};

export default DynamicIcon;