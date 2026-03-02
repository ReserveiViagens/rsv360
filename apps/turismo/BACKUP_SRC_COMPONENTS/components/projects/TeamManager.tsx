'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea, Switch } from '@/components/ui';
import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, Clock, CheckCircle, AlertCircle, XCircle, Eye, Copy, Filter, Search, Star, User, Tag, Mail, Phone, MapPin, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  status: 'active' | 'inactive' | 'on-leave';
  skills: string[];
  experience: number;
  hourlyRate: number;
  availability: number;
  currentProjects: string[];
  completedProjects: number;
  performance: number;
  joinDate: string;
  location: string;
  bio: string;
}

interface TeamManagerProps {
  onMemberSelect?: (member: TeamMember) => void;
}

export default function TeamManager({ onMemberSelect }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@rsv.com',
      phone: '(11) 99999-9999',
      role: 'Project Manager',
      department: 'Gestão de Projetos',
      avatar: '/avatars/joao.jpg',
      status: 'active',
      skills: ['Gestão de Projetos', 'Scrum', 'Jira', 'Liderança', 'Comunicação'],
      experience: 8,
      hourlyRate: 120,
      availability: 85,
      currentProjects: ['Sistema de Onboarding RSV'],
      completedProjects: 45,
      performance: 92,
      joinDate: '2020-03-15',
      location: 'São Paulo, SP',
      bio: 'Project Manager experiente com foco em metodologias ágeis e gestão de equipes de desenvolvimento.'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@rsv.com',
      phone: '(11) 88888-8888',
      role: 'Frontend Developer',
      department: 'Desenvolvimento',
      avatar: '/avatars/maria.jpg',
      status: 'active',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'UI/UX'],
      experience: 5,
      hourlyRate: 90,
      availability: 90,
      currentProjects: ['Sistema de Onboarding RSV'],
      completedProjects: 28,
      performance: 88,
      joinDate: '2021-06-20',
      location: 'São Paulo, SP',
      bio: 'Desenvolvedora Frontend apaixonada por criar interfaces intuitivas e responsivas.'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro.costa@rsv.com',
      phone: '(11) 77777-7777',
      role: 'Backend Developer',
      department: 'Desenvolvimento',
      avatar: '/avatars/pedro.jpg',
      status: 'active',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
      experience: 6,
      hourlyRate: 95,
      availability: 80,
      currentProjects: ['Sistema de Onboarding RSV'],
      completedProjects: 32,
      performance: 85,
      joinDate: '2021-01-10',
      location: 'São Paulo, SP',
      bio: 'Desenvolvedor Backend especializado em arquiteturas escaláveis e APIs robustas.'
    },
    {
      id: '4',
      name: 'Ana Lima',
      email: 'ana.lima@rsv.com',
      phone: '(11) 66666-6666',
      role: 'Data Engineer',
      department: 'Dados',
      avatar: '/avatars/ana.jpg',
      status: 'active',
      skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Machine Learning'],
      experience: 4,
      hourlyRate: 85,
      availability: 95,
      currentProjects: ['Migração de Dados'],
      completedProjects: 18,
      performance: 90,
      joinDate: '2022-02-15',
      location: 'São Paulo, SP',
      bio: 'Engenheira de dados focada em pipelines de dados e análise avançada.'
    }
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active' as const,
    skills: '',
    experience: 0,
    hourlyRate: 0,
    availability: 100,
    location: '',
    bio: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 90) return 'text-green-600';
    if (availability >= 80) return 'text-blue-600';
    if (availability >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMembers = members.filter(member => {
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDepartment && matchesStatus && matchesRole && matchesSearch;
  });

  const handleCreateMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      department: newMember.department,
      avatar: `/avatars/${newMember.name.toLowerCase().split(' ')[0]}.jpg`,
      status: newMember.status,
      skills: newMember.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      experience: newMember.experience,
      hourlyRate: newMember.hourlyRate,
      availability: newMember.availability,
      currentProjects: [],
      completedProjects: 0,
      performance: 80,
      joinDate: new Date().toISOString().split('T')[0],
      location: newMember.location,
      bio: newMember.bio
    };

    setMembers([...members, member]);
    setShowCreateForm(false);
    setNewMember({
      name: '', email: '', phone: '', role: '', department: '', status: 'active',
      skills: '', experience: 0, hourlyRate: 0, availability: 100, location: '', bio: ''
    });
    toast.success('Membro da equipe adicionado com sucesso!');
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      status: member.status,
      skills: member.skills.join(', '),
      experience: member.experience,
      hourlyRate: member.hourlyRate,
      availability: member.availability,
      location: member.location,
      bio: member.bio
    });
    setShowCreateForm(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;

    const updatedMembers = members.map(m => 
      m.id === editingMember.id ? {
        ...m,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        department: newMember.department,
        status: newMember.status,
        skills: newMember.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        experience: newMember.experience,
        hourlyRate: newMember.hourlyRate,
        availability: newMember.availability,
        location: newMember.location,
        bio: newMember.bio
      } : m
    );

    setMembers(updatedMembers);
    setEditingMember(null);
    setShowCreateForm(false);
    setNewMember({
      name: '', email: '', phone: '', role: '', department: '', status: 'active',
      skills: '', experience: 0, hourlyRate: 0, availability: 100, location: '', bio: ''
    });
    toast.success('Membro da equipe atualizado com sucesso!');
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
    toast.success('Membro da equipe removido com sucesso!');
  };

  const handleDuplicateMember = (member: TeamMember) => {
    const duplicatedMember = {
      ...member,
      id: Date.now().toString(),
      name: `${member.name} (Cópia)`,
      email: `${member.name.toLowerCase().split(' ')[0]}.copy@rsv.com`,
      currentProjects: [],
      completedProjects: 0,
      performance: 80,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setMembers([...members, duplicatedMember]);
    toast.success('Membro da equipe duplicado com sucesso!');
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <span className="text-2xl">{member.name.split(' ')[0][0]}</span>
            </Avatar>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{member.role}</p>
            <Badge className={getStatusColor(member.status)}>
              {member.status === 'active' && 'Ativo'}
              {member.status === 'inactive' && 'Inativo'}
              {member.status === 'on-leave' && 'Em Licença'}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Departamento:</span>
              <span className="font-medium">{member.department}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Experiência:</span>
              <span className="font-medium">{member.experience} anos</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Disponibilidade:</span>
              <span className={`font-medium ${getAvailabilityColor(member.availability)}`}>
                {member.availability}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Performance:</span>
              <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                {member.performance}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa/Hora:</span>
              <span className="font-medium">R$ {member.hourlyRate}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Projetos Ativos:</span>
              <span className="font-medium">{member.currentProjects.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Projetos Concluídos:</span>
              <span className="font-medium">{member.completedProjects}</span>
            </div>
          </div>

          {member.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Habilidades:</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {member.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{member.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {member.location}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditMember(member)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicateMember(member)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMemberSelect?.(member)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <span className="text-lg">{member.name.split(' ')[0][0]}</span>
            </Avatar>
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{member.department}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="text-center">
                <Badge className={getStatusColor(member.status)}>
                  {member.status === 'active' && 'Ativo'}
                  {member.status === 'inactive' && 'Inativo'}
                  {member.status === 'on-leave' && 'Em Licença'}
                </Badge>
              </div>
              <div className="text-center">
                <span className={`text-sm font-medium ${getAvailabilityColor(member.availability)}`}>
                  {member.availability}%
                </span>
                <p className="text-xs text-gray-500">Disponibilidade</p>
              </div>
              <div className="text-center">
                <span className={`text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                  {member.performance}%
                </span>
                <p className="text-xs text-gray-500">Performance</p>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">R$ {member.hourlyRate}</span>
                <p className="text-xs text-gray-500">Taxa/Hora</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditMember(member)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicateMember(member)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMemberSelect?.(member)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Equipes</h2>
          <p className="text-gray-600">Gerencie membros da equipe e suas habilidades</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <option value="all">Todos os Departamentos</option>
              <option value="Gestão de Projetos">Gestão de Projetos</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Dados">Dados</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="on-leave">Em Licença</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <option value="all">Todas as Funções</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="Designer">Designer</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <Input
              placeholder="Nome, email, função ou habilidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Formulário de Criação/Edição */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingMember ? 'Editar Membro' : 'Novo Membro da Equipe'}
            </h3>
            <Button variant="ghost" onClick={() => {
              setShowCreateForm(false);
              setEditingMember(null);
              setNewMember({
                name: '', email: '', phone: '', role: '', department: '', status: 'active',
                skills: '', experience: 0, hourlyRate: 0, availability: 100, location: '', bio: ''
              });
            }}>
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <Input
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <Select value={newMember.role} onValueChange={(value: any) => setNewMember({...newMember, role: value})}>
                <option value="">Selecione uma função</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Designer">Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <Select value={newMember.department} onValueChange={(value: any) => setNewMember({...newMember, department: value})}>
                <option value="">Selecione um departamento</option>
                <option value="Gestão de Projetos">Gestão de Projetos</option>
                <option value="Desenvolvimento">Desenvolvimento</option>
                <option value="Dados">Dados</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="Suporte">Suporte</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={newMember.status} onValueChange={(value: any) => setNewMember({...newMember, status: value})}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="on-leave">Em Licença</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
              <Input
                type="number"
                value={newMember.experience}
                onChange={(e) => setNewMember({...newMember, experience: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taxa por Hora (R$)</label>
              <Input
                type="number"
                value={newMember.hourlyRate}
                onChange={(e) => setNewMember({...newMember, hourlyRate: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newMember.availability}
                onChange={(e) => setNewMember({...newMember, availability: Number(e.target.value)})}
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <Input
                value={newMember.location}
                onChange={(e) => setNewMember({...newMember, location: e.target.value})}
                placeholder="Cidade, Estado"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades</label>
              <Input
                value={newMember.skills}
                onChange={(e) => setNewMember({...newMember, skills: e.target.value})}
                placeholder="habilidade1, habilidade2, habilidade3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
              <Textarea
                value={newMember.bio}
                onChange={(e) => setNewMember({...newMember, bio: e.target.value})}
                placeholder="Descreva brevemente o perfil profissional"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowCreateForm(false);
              setEditingMember(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={editingMember ? handleUpdateMember : handleCreateMember}>
              {editingMember ? 'Atualizar' : 'Adicionar'} Membro
            </Button>
          </div>
        </Card>
      )}

      {/* Visualização de Membros */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {filteredMembers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum membro encontrado</h3>
            <p className="text-gray-400">Adicione seu primeiro membro da equipe ou ajuste os filtros</p>
          </div>
        </Card>
      )}
    </div>
  );
}
