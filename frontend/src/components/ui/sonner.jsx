import { useTheme } from "../../contexts/ThemeContext"; // 1. Mudei o import para nosso context
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme } = useTheme(); // 2. Usando nosso hook

  return (
    <Sonner
      // 3. Passando 'light' ou 'dark' diretamente para o componente
      theme={theme}
      className="toaster group"
      // 4. O style customizado não é mais necessário, o tema cuida disso
      {...props} />
  );
}

export { Toaster }