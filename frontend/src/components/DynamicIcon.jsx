// src/components/DynamicIcon.jsx

import React from 'react';
import { icons } from 'lucide-react';

const DynamicIcon = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Retorna um ícone padrão caso o nome seja inválido
    const DefaultIcon = icons.CircleHelp || icons.CircleHelp;
    return DefaultIcon ? <DefaultIcon {...props} /> : null;
  }

  return <LucideIcon {...props} />;
};

export default DynamicIcon;
