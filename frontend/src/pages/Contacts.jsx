import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Phone, Mail, Edit2, Trash2, Search, Users } from 'lucide-react';

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
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-green-600" /> Meus Contatos
          </h1>
          <p className="text-gray-500 text-sm">Gerencie as pessoas com quem você agenda reuniões.</p>
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
        <p className="text-center text-gray-500 py-10">Carregando contatos...</p>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum contato encontrado.</p>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="text-green-600 hover:underline mt-2">Limpar busca</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{contact.name}</h3>
                      <p className="text-xs text-gray-500">Adicionado recentemente</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(contact)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {contact.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-500" />
                      <span>{contact.whatsapp}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 italic">
                      <Phone size={14} /> Sem telefone
                    </div>
                  )}
                  
                  {contact.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-500" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 italic">
                      <Mail size={14} /> Sem e-mail
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
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