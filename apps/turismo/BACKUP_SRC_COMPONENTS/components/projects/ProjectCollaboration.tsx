'use client';
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs, Select, Avatar, Progress, Textarea, Switch } from '@/components/ui';
import { Plus, Settings, Edit, Trash2, Users, Calendar, Target, Clock, CheckCircle, AlertCircle, XCircle, Eye, Copy, Filter, Search, Star, User, Tag, Mail, Phone, MapPin, Award, TrendingUp, MessageSquare, FileText, Image, Video, Link, ThumbsUp, Share2, MoreVertical, Send, Paperclip, Smile, AtSign } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  timestamp: string;
  projectId: string;
  taskId?: string;
  milestoneId?: string;
  likes: number;
  replies: Comment[];
  attachments: Attachment[];
  mentions: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'other';
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  projectId: string;
  timestamp: string;
  type: 'progress' | 'milestone' | 'issue' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  likes: number;
  comments: number;
  attachments: Attachment[];
}

interface TeamChat {
  id: string;
  name: string;
  type: 'project' | 'department' | 'general';
  members: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
}

interface ProjectCollaborationProps {
  onCommentSelect?: (comment: Comment) => void;
  onUpdateSelect?: (update: ProjectUpdate) => void;
  onChatSelect?: (chat: TeamChat) => void;
}

export default function ProjectCollaboration({ onCommentSelect, onUpdateSelect, onChatSelect }: ProjectCollaborationProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'Excelente progresso na implementação da autenticação! A interface está muito intuitiva.',
      author: 'João Silva',
      authorAvatar: '/avatars/joao.jpg',
      authorRole: 'Project Manager',
      timestamp: '2025-01-20T10:30:00',
      projectId: '1',
      taskId: '1',
      likes: 3,
      replies: [],
      attachments: [],
      mentions: ['Maria Santos']
    },
    {
      id: '2',
      content: 'Preciso de ajuda com a validação dos formulários. @Pedro Costa, pode revisar o código?',
      author: 'Maria Santos',
      authorAvatar: '/avatars/maria.jpg',
      authorRole: 'Frontend Developer',
      timestamp: '2025-01-20T14:15:00',
      projectId: '1',
      taskId: '2',
      likes: 1,
      replies: [
        {
          id: '2.1',
          content: 'Claro! Vou revisar hoje mesmo. Envie o PR que eu dou uma olhada.',
          author: 'Pedro Costa',
          authorAvatar: '/avatars/pedro.jpg',
          authorRole: 'Backend Developer',
          timestamp: '2025-01-20T15:00:00',
          projectId: '1',
          likes: 2,
          replies: [],
          attachments: [],
          mentions: []
        }
      ],
      attachments: [],
      mentions: ['Pedro Costa']
    }
  ]);

  const [updates, setUpdates] = useState<ProjectUpdate[]>([
    {
      id: '1',
      title: 'Milestone: Definição de Requisitos Concluído',
      content: 'Finalizamos com sucesso a documentação completa dos requisitos funcionais e não funcionais. O cliente aprovou todos os documentos.',
      author: 'João Silva',
      authorAvatar: '/avatars/joao.jpg',
      projectId: '1',
      timestamp: '2025-01-20T16:00:00',
      type: 'milestone',
      priority: 'medium',
      tags: ['requisitos', 'documentação', 'cliente'],
      likes: 5,
      comments: 2,
      attachments: [
        {
          id: '1',
          name: 'requisitos_v1.0.pdf',
          type: 'document',
          size: 2048576,
          url: '/files/requisitos_v1.0.pdf',
          uploadedBy: 'João Silva',
          uploadedAt: '2025-01-20T16:00:00'
        }
      ]
    },
    {
      id: '2',
      title: 'Problema Identificado: Performance do Login',
      content: 'Identificamos um problema de performance no sistema de login. Estamos investigando e implementando otimizações.',
      author: 'Pedro Costa',
      authorAvatar: '/avatars/pedro.jpg',
      projectId: '1',
      timestamp: '2025-01-20T11:30:00',
      type: 'issue',
      priority: 'high',
      tags: ['performance', 'login', 'bug'],
      likes: 2,
      comments: 4,
      attachments: []
    }
  ]);

  const [chats, setChats] = useState<TeamChat[]>([
    {
      id: '1',
      name: 'Sistema RSV - Geral',
      type: 'project',
      members: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'],
      lastMessage: 'Reunião de alinhamento amanhã às 10h',
      lastMessageTime: '2025-01-20T17:30:00',
      unreadCount: 2,
      isActive: true
    },
    {
      id: '2',
      name: 'Dev Team',
      type: 'department',
      members: ['Maria Santos', 'Pedro Costa', 'Ana Lima'],
      lastMessage: 'PR aprovado e mergeado com sucesso!',
      lastMessageTime: '2025-01-20T16:45:00',
      unreadCount: 0,
      isActive: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'updates' | 'comments' | 'chats' | 'files'>('updates');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newComment, setNewComment] = useState({
    content: '',
    projectId: '1',
    taskId: '',
    milestoneId: '',
    mentions: ''
  });

  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    priority: 'medium' as const,
    tags: ''
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress': return 'bg-blue-100 text-blue-800';
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredUpdates = updates.filter(update => {
    const matchesProject = selectedProject === 'all' || update.projectId === selectedProject;
    const matchesType = selectedType === 'all' || update.type === selectedType;
    const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesProject && matchesType && matchesSearch;
  });

  const handleCreateComment = () => {
    if (!newComment.content) {
      toast.error('Digite o conteúdo do comentário');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.content,
      author: 'Usuário Atual',
      authorAvatar: '/avatars/current.jpg',
      authorRole: 'Developer',
      timestamp: new Date().toISOString(),
      projectId: newComment.projectId,
      taskId: newComment.taskId || undefined,
      milestoneId: newComment.milestoneId || undefined,
      likes: 0,
      replies: [],
      attachments: [],
      mentions: newComment.mentions.split(',').map(mention => mention.trim()).filter(mention => mention)
    };

    setComments([...comments, comment]);
    setShowCommentForm(false);
    setNewComment({
      content: '', projectId: '1', taskId: '', milestoneId: '', mentions: ''
    });
    toast.success('Comentário adicionado com sucesso!');
  };

  const handleCreateUpdate = () => {
    if (!newUpdate.title || !newUpdate.content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const update: ProjectUpdate = {
      id: Date.now().toString(),
      title: newUpdate.title,
      content: newUpdate.content,
      author: 'Usuário Atual',
      authorAvatar: '/avatars/current.jpg',
      projectId: '1',
      timestamp: new Date().toISOString(),
      type: newUpdate.type,
      priority: newUpdate.priority,
      tags: newUpdate.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      comments: 0,
      attachments: []
    };

    setUpdates([...updates, update]);
    setShowUpdateForm(false);
    setNewUpdate({
      title: '', content: '', type: 'general', priority: 'medium', tags: ''
    });
    toast.success('Atualização criada com sucesso!');
  };

  const handleLikeUpdate = (updateId: string) => {
    setUpdates(updates.map(u => 
      u.id === updateId ? { ...u, likes: u.likes + 1 } : u
    ));
    toast.success('Curtida adicionada!');
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
    toast.success('Curtida adicionada!');
  };

  const renderUpdatesTab = () => (
    <div className="space-y-4">
      {filteredUpdates.map((update) => (
        <Card key={update.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <span className="text-lg">{update.author.split(' ')[0][0]}</span>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{update.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span>{update.author}</span>
                    <span>•</span>
                    <span>{formatTimestamp(update.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(update.type)}>
                    {update.type === 'progress' && 'Progresso'}
                    {update.type === 'milestone' && 'Milestone'}
                    {update.type === 'issue' && 'Problema'}
                    {update.type === 'general' && 'Geral'}
                  </Badge>
                  <Badge className={getPriorityColor(update.priority)}>
                    {update.priority === 'low' && 'Baixa'}
                    {update.priority === 'medium' && 'Média'}
                    {update.priority === 'high' && 'Alta'}
                    {update.priority === 'critical' && 'Crítica'}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{update.content}</p>

              {update.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {update.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {update.attachments.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Anexos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {update.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        {getFileTypeIcon(attachment.type)}
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeUpdate(update.id)}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{update.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{update.comments}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateSelect?.(update)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCommentsTab = () => (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <span className="text-sm">{comment.author.split(' ')[0][0]}</span>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">{comment.authorRole}</span>
                  <span className="text-sm text-gray-400">{formatTimestamp(comment.timestamp)}</span>
                </div>
                
                <p className="text-gray-700 mb-2">{comment.content}</p>
                
                {comment.mentions.length > 0 && (
                  <div className="flex items-center space-x-1 mb-2">
                    <AtSign className="w-3 h-3 text-blue-500" />
                    {comment.mentions.map((mention, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {mention}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{comment.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-12 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <span className="text-xs">{reply.author.split(' ')[0][0]}</span>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{reply.author}</span>
                        <span className="text-sm text-gray-500">{reply.authorRole}</span>
                        <span className="text-sm text-gray-400">{formatTimestamp(reply.timestamp)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{reply.content}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(reply.id)}
                          className="flex items-center space-x-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{reply.likes}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderChatsTab = () => (
    <div className="space-y-3">
      {chats.map((chat) => (
        <Card key={chat.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onChatSelect?.(chat)}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unreadCount}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                <span className="text-xs text-gray-500">{formatTimestamp(chat.lastMessageTime)}</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-1">{chat.lastMessage}</p>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{chat.members.length} membros</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{chat.type === 'project' ? 'Projeto' : chat.type === 'department' ? 'Departamento' : 'Geral'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {updates.flatMap(update => update.attachments).map((attachment) => (
          <Card key={attachment.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {getFileTypeIcon(attachment.type)}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{attachment.name}</h4>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                <p className="text-xs text-gray-400">por {attachment.uploadedBy}</p>
              </div>
              
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Colaboração e Comunicação</h2>
          <p className="text-gray-600">Gerencie comunicação, comentários e colaboração da equipe</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCommentForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Comentário
          </Button>
          <Button onClick={() => setShowUpdateForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Atualização
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <option value="all">Todos os Projetos</option>
              <option value="1">Sistema de Onboarding RSV</option>
              <option value="2">Migração de Dados</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <option value="all">Todos os Tipos</option>
              <option value="progress">Progresso</option>
              <option value="milestone">Milestone</option>
              <option value="issue">Problema</option>
              <option value="general">Geral</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <Input
              placeholder="Título, conteúdo ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <div className="flex space-x-1 mb-4">
          <Button
            variant={activeTab === 'updates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('updates')}
            className="flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Atualizações</span>
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('comments')}
            className="flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comentários</span>
          </Button>
          <Button
            variant={activeTab === 'chats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chats')}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Chats</span>
          </Button>
          <Button
            variant={activeTab === 'files' ? 'default' : 'outline'}
            onClick={() => setActiveTab('files')}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Arquivos</span>
          </Button>
        </div>

        <div className="mt-4">
          {activeTab === 'updates' && renderUpdatesTab()}
          {activeTab === 'comments' && renderCommentsTab()}
          {activeTab === 'chats' && renderChatsTab()}
          {activeTab === 'files' && renderFilesTab()}
        </div>
      </Tabs>

      {/* Formulário de Comentário */}
      {showCommentForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Novo Comentário</h3>
            <Button variant="ghost" onClick={() => setShowCommentForm(false)}>
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentário *</label>
              <Textarea
                value={newComment.content}
                onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                placeholder="Digite seu comentário..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                <Select value={newComment.projectId} onValueChange={(value: any) => setNewComment({...newComment, projectId: value})}>
                  <option value="1">Sistema de Onboarding RSV</option>
                  <option value="2">Migração de Dados</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarefa (opcional)</label>
                <Input
                  value={newComment.taskId}
                  onChange={(e) => setNewComment({...newComment, taskId: e.target.value})}
                  placeholder="ID da tarefa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menções</label>
                <Input
                  value={newComment.mentions}
                  onChange={(e) => setNewComment({...newComment, mentions: e.target.value})}
                  placeholder="@usuario1, @usuario2"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCommentForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateComment}>
              Adicionar Comentário
            </Button>
          </div>
        </Card>
      )}

      {/* Formulário de Atualização */}
      {showUpdateForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nova Atualização</h3>
            <Button variant="ghost" onClick={() => setShowUpdateForm(false)}>
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <Input
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                placeholder="Digite o título da atualização"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
              <Textarea
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({...newUpdate, content: e.target.value})}
                placeholder="Descreva a atualização..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <Select value={newUpdate.type} onValueChange={(value: any) => setNewUpdate({...newUpdate, type: value})}>
                  <option value="general">Geral</option>
                  <option value="progress">Progresso</option>
                  <option value="milestone">Milestone</option>
                  <option value="issue">Problema</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <Select value={newUpdate.priority} onValueChange={(value: any) => setNewUpdate({...newUpdate, priority: value})}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <Input
                  value={newUpdate.tags}
                  onChange={(e) => setNewUpdate({...newUpdate, tags: e.target.value})}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowUpdateForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUpdate}>
              Criar Atualização
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
