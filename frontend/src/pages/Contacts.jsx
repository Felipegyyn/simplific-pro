import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Phone, Mail, Edit2, Trash2, Search, Users } from 'lucide-react';
import styles from './Contacts.module.css';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await apiService.get('/api/contacts');
      setContacts(data || []);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({ name: contact.name, email: contact.email || '', whatsapp: contact.whatsapp || '' });
    } else {
      setEditingContact(null);
      setFormData({ name: '', email: '', whatsapp: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await apiService.put(`/api/contacts/${editingContact.id}`, formData);
      } else {
        await apiService.post('/api/contacts', formData);
      }
      setIsModalOpen(false);
      fetchContacts(); // Recarrega a lista
    } catch (error) {
      alert('Erro ao salvar contato. Verifique os dados.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await apiService.delete(`/api/contacts/${id}`);
        setContacts(contacts.filter(c => c.id !== id));
      } catch (error) {
        alert('Erro ao excluir contato.');
      }
    }
  };

  // Filtro de busca
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle + " flex items-center gap-2"}>
            <Users className="text-cyan-600 dark:text-cyan-400" /> Meus Contatos
          </h1>
          <p className={styles.pageSubtitle}>Gerencie as pessoas com quem você agenda reuniões.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Contato
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Buscar por nome ou email..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Contatos */}
      {loading ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">Carregando contatos...</p>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum contato encontrado.</p>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="text-cyan-600 dark:text-cyan-400 hover:underline mt-2">Limpar busca</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className={styles.premiumCard}>
              <div className={styles.cardContent}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{contact.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Adicionado recentemente</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(contact)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {contact.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-cyan-600 dark:text-cyan-400" />
                      <span>{contact.whatsapp}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 italic">
                      <Phone size={14} /> Sem telefone
                    </div>
                  )}
                  
                  {contact.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-500" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 italic">
                      <Mail size={14} /> Sem email
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Adicionar/Editar Contato */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-white">{editingContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="name" required className="pl-9" placeholder="Ex: Carlos Silva" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" className="pl-9" placeholder="carlos@exemplo.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="whatsapp" className="pl-9" placeholder="11999998888" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                {editingContact ? 'Salvar Alterações' : 'Cadastrar Contato'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;