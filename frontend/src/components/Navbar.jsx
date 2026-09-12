import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const go = (path) => { setOpen(false); navigate(path); window.scrollTo(0, 0); };
  const links = [['/beneficios', 'Recursos'], ['/inteligencia', 'Inteligência'], ['/seguranca', 'Segurança'], ['/planos', 'Planos']];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080908]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <button type="button" onClick={() => go('/')} className="flex items-center gap-2.5 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-[#10130d]">SP</span>
          <span className="text-base font-semibold tracking-[-.02em] text-white">Simplific <span className="text-white/40">Pro</span></span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([path, label]) => <button key={path} type="button" onClick={() => go(path)} className="text-sm text-white/55 transition-colors hover:text-lime-300">{label}</button>)}
          <Button type="button" onClick={() => go('/login')} variant="outline" className="h-10 rounded-full border-white/15 bg-white/[.03] px-5 text-sm text-white hover:bg-white/10">Entrar</Button>
          <Button type="button" onClick={() => go('/planos')} className="h-10 rounded-full bg-lime-300 px-5 text-sm font-semibold text-[#10130d] hover:bg-lime-200">Começar agora</Button>
        </div>
        <button type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((value) => !value)} className="rounded-full border border-white/10 p-2 text-white md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {open && <div className="border-t border-white/10 bg-[#0b0c0b] px-5 py-5 md:hidden"><div className="flex flex-col gap-2">{links.map(([path, label]) => <button key={path} type="button" onClick={() => go(path)} className="rounded-xl px-3 py-3 text-left text-sm text-white/70 hover:bg-white/5 hover:text-lime-300">{label}</button>)}<div className="mt-2 grid grid-cols-2 gap-2"><Button type="button" onClick={() => go('/login')} variant="outline" className="rounded-full border-white/15 text-white">Entrar</Button><Button type="button" onClick={() => go('/planos')} className="rounded-full bg-lime-300 font-semibold text-[#10130d]">Começar</Button></div></div></div>}
    </nav>
  );
};

export default Navbar;
