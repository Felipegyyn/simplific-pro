import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Settings, Users, LogOut, 
  ChevronLeft, ChevronRight, ChevronDown, Building2, 
  Wallet, PieChart, ArrowLeftCircle, ArrowDownCircle, 
  ArrowUpCircle, ShoppingBag, Package, Box, 
  FileSpreadsheet, Scale, ShoppingCart, Truck, 
  ClipboardList, CheckSquare, FileCheck, Landmark, Briefcase, Target, Tags
} from 'lucide-react';
import { cn } from "@/lib/utils"; 

const SidebarBusiness = ({ user, onLogout, isMobileOpen, closeMobileMenu }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  // Estado inicial vazio = todos fechados
  const [openMenus, setOpenMenus] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTRUTURA DOS DADOS (EMPRESARIAL) ---
  const menuStructure = [
    {
      title: 'Gestão',
      icon: LayoutDashboard,
      color: 'text-cyan-400',
      items: [
        { name: 'Visão Geral', path: '/business', icon: LayoutDashboard }, 
        { name: 'Planejamento', path: '/business/planning', icon: Target },
        { name: 'Fluxo de Caixa', path: '/business/cash-flow', icon: Wallet },
        { name: 'Contas a Pagar', path: '/business/payables', icon: ArrowDownCircle },
        { name: 'Contas a Receber', path: '/business/receivables', icon: ArrowUpCircle },
        { name: 'Fornecedores/Clientes', path: '/business/stakeholders', icon: Users },
      ]
    },
    {
      title: 'Vendas',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      items: [
        { name: 'Venda de Serviço', path: '/business/sales/service', icon: Briefcase },
        { name: 'Venda de Produto', path: '/business/sales', icon: Package },
        { name: 'Estoque', path: '/business/inventory', icon: Box },
      ]
    },
    {
      title: 'Suprimentos',
      icon: Truck,
      color: 'text-amber-400',
      items: [
        { name: 'Pedido de Compra', path: '/business/purchase-request', icon: ClipboardList },
        { name: 'Aprovações', path: '/business/approvals', icon: CheckSquare },
        { name: 'Ord. Compra/Serviço', path: '/business/orders', icon: FileCheck },
      ]
    },
    {
      title: 'Relatórios',
      icon: FileText,
      color: 'text-violet-400',
      items: [
        { name: 'DRE Gerencial', path: '/business/reports/dre', icon: FileText },
        { name: 'Análise Vertical', path: '/business/reports/analysis', icon: PieChart },
        { name: 'Extrato Bancário', path: '/business/reports/statement', icon: FileSpreadsheet },
        { name: 'Saldos', path: '/business/reports/balances', icon: Scale },
        { name: 'Relatório de Compras', path: '/business/reports/purchasing', icon: ShoppingCart },
      ]
    },
    {
      title: 'Configurações',
      icon: Settings,
      color: 'text-slate-400',
      items: [
        { name: 'Dados da Empresa', path: '/business/settings/company', icon: Building2 },
        { name: 'Categorias Fin.', path: '/business/settings/categories', icon: Tags },
        { name: 'Sócios e Acessos', path: '/business/settings/team', icon: Users },
        { name: 'Contas Correntes', path: '/business/settings/bank-accounts', icon: Landmark },
      ]
    }
  ];

  const toggleMenu = (title) => {
    if (!isDesktopOpen) {
      setIsDesktopOpen(true);
      setOpenMenus(prev => ({ ...prev, [title]: true }));
      return;
    }
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLinkClick = () => { if (isMobileOpen) closeMobileMenu(); };

  return (
    <div className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col h-screen transition-all duration-300 ease-in-out md:relative",
        "glass-panel rounded-none border-y-0 border-l-0 border-white/5", 
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isDesktopOpen ? "md:w-64" : "md:w-20"
      )}
    >
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className="absolute -right-3 top-9 bg-slate-900 border border-white/10 rounded-full p-1.5 z-10 text-slate-400 hover:text-white shadow-xl transition-colors hidden md:block"
      >
        {isDesktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* HEADER EMPRESA */}
      <div className={cn("flex items-center gap-3 mb-2 p-6 h-20", !isDesktopOpen && "justify-center px-2")}>
        <div className="bg-cyan-500/10 p-2 rounded-lg shrink-0 border border-cyan-500/20">
             <Building2 className="h-6 w-6 text-cyan-400" />
        </div>
        {isDesktopOpen && (
            <div className="overflow-hidden">
                <span className="block text-sm font-bold text-white whitespace-nowrap truncate">Minha Empresa</span>
                <span className="text-xs text-slate-400">Simplific PJ</span>
            </div>
        )}
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2 px-3 overflow-y-auto scrollbar-none pb-4">
        {menuStructure.map((group) => {
          const isOpen = openMenus[group.title];
          const isChildActive = group.items.some(item => location.pathname === item.path);

          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleMenu(group.title)}
                className={cn(
                  "w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative select-none",
                  !isDesktopOpen && "justify-center",
                  (!isOpen && isChildActive) || isOpen ? "bg-white/5 text-white font-medium shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <group.icon className={cn("h-5 w-5 shrink-0 transition-colors", isDesktopOpen ? "mr-3" : "", group.color)} />
                {isDesktopOpen && (
                  <>
                    <span className="flex-1 text-left text-sm truncate">{group.title}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform opacity-50 shrink-0", isOpen ? "rotate-180" : "")} />
                  </>
                )}
              </button>

              {isDesktopOpen && isOpen && (
                <div className="space-y-1 ml-4 border-l border-white/5 pl-2 animate-in slide-in-from-top-2 duration-200">
                  {group.items.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={handleLinkClick}
                        className={({ isActive }) => cn(
                            "flex items-center p-2 rounded-lg transition-colors text-sm",
                            isActive ? "active-gradient text-cyan-400 font-medium" : "text-slate-400 hover:text-white hover:bg-white/5"
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 mr-3 opacity-70 shrink-0" /> 
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* FOOTER - VOLTAR PARA PESSOAL */}
      <div className="p-4 border-t border-white/5 bg-white/2 mt-auto space-y-2">
        
        {/* Botão de Voltar ao Contexto Pessoal */}
        <button 
          onClick={() => navigate('/dashboard')}
          className={cn(
            "flex items-center w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-95",
            !isDesktopOpen && "justify-center"
          )}
          title="Voltar para Pessoa Física"
        >
          <ArrowLeftCircle className="h-5 w-5 shrink-0" />
          {isDesktopOpen && <span className="ml-3 text-sm font-medium truncate">Voltar para Pessoal</span>}
        </button>

        <button 
          onClick={() => { navigate('/login'); onLogout(); }}
          className={cn(
            "flex items-center w-full p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-colors",
            !isDesktopOpen && "justify-center"
          )}
          title="Sair"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {isDesktopOpen && <span className="ml-3 text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default SidebarBusiness;