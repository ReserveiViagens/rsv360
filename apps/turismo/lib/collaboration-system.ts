// Sistema de Colaboração entre Usuários para Templates

import { Template } from './templates-data';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  department?: string;
  joinedAt: string;
  lastActive: string;
  permissions: UserPermissions;
}

export interface UserPermissions {
  canCreateTemplates: boolean;
  canEditTemplates: boolean;
  canDeleteTemplates: boolean;
  canShareTemplates: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

export interface TemplateCollaboration {
  templateId: string;
  sharedBy: string;
  sharedWith: string[];
  sharedAt: string;
  permissions: CollaborationPermissions;
  message?: string;
  expiresAt?: string;
}

export interface CollaborationPermissions {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canUse: boolean;
}

export interface TemplateComment {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // Para respostas
  mentions: string[]; // IDs dos usuários mencionados
  reactions: CommentReaction[];
}

export interface CommentReaction {
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members: WorkspaceMember[];
  templates: string[]; // IDs dos templates
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: string;
  permissions: CollaborationPermissions;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowGuestAccess: boolean;
  requireApprovalForTemplates: boolean;
  enableComments: boolean;
  enableVersionHistory: boolean;
  autoBackup: boolean;
}

export interface CollaborationActivity {
  id: string;
  type: 'template_shared' | 'template_edited' | 'comment_added' | 'user_joined' | 'workspace_created';
  userId: string;
  userName: string;
  templateId?: string;
  templateName?: string;
  workspaceId?: string;
  workspaceName?: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

export class CollaborationManager {
  private static USERS_KEY = 'rsv360_users';
  private static COLLABORATIONS_KEY = 'rsv360_collaborations';
  private static COMMENTS_KEY = 'rsv360_comments';
  private static WORKSPACES_KEY = 'rsv360_workspaces';
  private static ACTIVITIES_KEY = 'rsv360_activities';
  private static currentUserId = 'default_user';

  // Gerenciamento de usuários
  static createUser(userData: Omit<User, 'id' | 'joinedAt' | 'lastActive'>): User {
    const user: User = {
      ...userData,
      id: this.generateId(),
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    this.logActivity({
      type: 'user_joined',
      userId: user.id,
      userName: user.name,
      description: `${user.name} entrou na plataforma`
    });

    return user;
  }

  static getAllUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultUsers();
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return this.getDefaultUsers();
    }
  }

  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }

  static updateUserLastActive(userId: string): void {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex].lastActive = new Date().toISOString();
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  // Compartilhamento de templates
  static shareTemplate(
    templateId: string,
    sharedWith: string[],
    permissions: CollaborationPermissions,
    message?: string,
    expiresAt?: string
  ): TemplateCollaboration {
    const collaboration: TemplateCollaboration = {
      templateId,
      sharedBy: this.currentUserId,
      sharedWith,
      sharedAt: new Date().toISOString(),
      permissions,
      message,
      expiresAt
    };

    const collaborations = this.getAllCollaborations();
    
    // Remover colaboração existente para o mesmo template
    const filtered = collaborations.filter(c => c.templateId !== templateId);
    filtered.push(collaboration);
    
    localStorage.setItem(this.COLLABORATIONS_KEY, JSON.stringify(filtered));

    // Log da atividade
    const sharedUser = this.getUserById(this.currentUserId);
    this.logActivity({
      type: 'template_shared',
      userId: this.currentUserId,
      userName: sharedUser?.name || 'Usuário',
      templateId,
      description: `Template compartilhado com ${sharedWith.length} usuário(s)`
    });

    return collaboration;
  }

  static getSharedTemplates(userId: string): TemplateCollaboration[] {
    const collaborations = this.getAllCollaborations();
    const now = new Date();

    return collaborations.filter(collab => {
      // Verificar se o usuário tem acesso
      const hasAccess = collab.sharedWith.includes(userId) || collab.sharedBy === userId;
      
      // Verificar se não expirou
      const notExpired = !collab.expiresAt || new Date(collab.expiresAt) > now;
      
      return hasAccess && notExpired;
    });
  }

  static getTemplatePermissions(templateId: string, userId: string): CollaborationPermissions | null {
    const collaborations = this.getAllCollaborations();
    const collaboration = collaborations.find(c => 
      c.templateId === templateId && 
      (c.sharedWith.includes(userId) || c.sharedBy === userId)
    );

    return collaboration?.permissions || null;
  }

  // Sistema de comentários
  static addComment(
    templateId: string,
    content: string,
    parentId?: string,
    mentions: string[] = []
  ): TemplateComment {
    const user = this.getUserById(this.currentUserId);
    
    const comment: TemplateComment = {
      id: this.generateId(),
      templateId,
      userId: this.currentUserId,
      userName: user?.name || 'Usuário',
      userAvatar: user?.avatar,
      content,
      createdAt: new Date().toISOString(),
      parentId,
      mentions,
      reactions: []
    };

    const comments = this.getAllComments();
    comments.push(comment);
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));

    this.logActivity({
      type: 'comment_added',
      userId: this.currentUserId,
      userName: user?.name || 'Usuário',
      templateId,
      description: `Comentário adicionado no template`
    });

    return comment;
  }

  static getTemplateComments(templateId: string): TemplateComment[] {
    const comments = this.getAllComments();
    return comments
      .filter(comment => comment.templateId === templateId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static addReaction(commentId: string, emoji: string): void {
    const comments = this.getAllComments();
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex >= 0) {
      const comment = comments[commentIndex];
      const user = this.getUserById(this.currentUserId);
      
      // Remover reação anterior do mesmo usuário
      comment.reactions = comment.reactions.filter(r => r.userId !== this.currentUserId);
      
      // Adicionar nova reação
      comment.reactions.push({
        userId: this.currentUserId,
        userName: user?.name || 'Usuário',
        emoji,
        createdAt: new Date().toISOString()
      });

      localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    }
  }

  // Workspaces de equipe
  static createWorkspace(
    name: string,
    description: string,
    settings: WorkspaceSettings
  ): TeamWorkspace {
    const workspace: TeamWorkspace = {
      id: this.generateId(),
      name,
      description,
      createdBy: this.currentUserId,
      createdAt: new Date().toISOString(),
      members: [{
        userId: this.currentUserId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        permissions: {
          canView: true,
          canEdit: true,
          canComment: true,
          canShare: true,
          canUse: true
        }
      }],
      templates: [],
      settings
    };

    const workspaces = this.getAllWorkspaces();
    workspaces.push(workspace);
    localStorage.setItem(this.WORKSPACES_KEY, JSON.stringify(workspaces));

    const user = this.getUserById(this.currentUserId);
    this.logActivity({
      type: 'workspace_created',
      userId: this.currentUserId,
      userName: user?.name || 'Usuário',
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      description: `Workspace "${name}" criado`
    });

    return workspace;
  }

  static addMemberToWorkspace(
    workspaceId: string,
    userId: string,
    role: WorkspaceMember['role'],
    permissions: CollaborationPermissions
  ): boolean {
    const workspaces = this.getAllWorkspaces();
    const workspaceIndex = workspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex >= 0) {
      const workspace = workspaces[workspaceIndex];
      
      // Verificar se já é membro
      if (workspace.members.some(m => m.userId === userId)) {
        return false;
      }

      workspace.members.push({
        userId,
        role,
        joinedAt: new Date().toISOString(),
        permissions
      });

      localStorage.setItem(this.WORKSPACES_KEY, JSON.stringify(workspaces));
      return true;
    }

    return false;
  }

  static getUserWorkspaces(userId: string): TeamWorkspace[] {
    const workspaces = this.getAllWorkspaces();
    return workspaces.filter(workspace => 
      workspace.members.some(member => member.userId === userId)
    );
  }

  // Atividades e logs
  static logActivity(activity: Omit<CollaborationActivity, 'id' | 'createdAt'>): void {
    const fullActivity: CollaborationActivity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    const activities = this.getAllActivities();
    activities.unshift(fullActivity); // Adicionar no início
    
    // Manter apenas as últimas 1000 atividades
    const trimmedActivities = activities.slice(0, 1000);
    
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(trimmedActivities));
  }

  static getRecentActivities(limit: number = 50): CollaborationActivity[] {
    const activities = this.getAllActivities();
    return activities.slice(0, limit);
  }

  static getUserActivities(userId: string, limit: number = 20): CollaborationActivity[] {
    const activities = this.getAllActivities();
    return activities
      .filter(activity => activity.userId === userId)
      .slice(0, limit);
  }

  // Estatísticas de colaboração
  static getCollaborationStats(): {
    totalUsers: number;
    activeUsers: number;
    sharedTemplates: number;
    totalComments: number;
    totalWorkspaces: number;
    recentActivities: number;
  } {
    const users = this.getAllUsers();
    const collaborations = this.getAllCollaborations();
    const comments = this.getAllComments();
    const workspaces = this.getAllWorkspaces();
    const activities = this.getAllActivities();

    // Usuários ativos (últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const activeUsers = users.filter(user => 
      new Date(user.lastActive) > weekAgo
    ).length;

    // Atividades recentes (últimas 24 horas)
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    
    const recentActivities = activities.filter(activity =>
      new Date(activity.createdAt) > dayAgo
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      sharedTemplates: collaborations.length,
      totalComments: comments.length,
      totalWorkspaces: workspaces.length,
      recentActivities
    };
  }

  // Notificações
  static getNotifications(userId: string): {
    id: string;
    type: 'mention' | 'share' | 'comment' | 'workspace_invite';
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    actionUrl?: string;
  }[] {
    const notifications = [];
    
    // Notificações de menções em comentários
    const comments = this.getAllComments();
    const mentionComments = comments.filter(comment => 
      comment.mentions.includes(userId) && comment.userId !== userId
    );

    mentionComments.forEach(comment => {
      notifications.push({
        id: `mention_${comment.id}`,
        type: 'mention' as const,
        title: 'Você foi mencionado',
        message: `${comment.userName} mencionou você em um comentário`,
        createdAt: comment.createdAt,
        read: false,
        actionUrl: `/templates/${comment.templateId}#comment-${comment.id}`
      });
    });

    // Notificações de templates compartilhados
    const collaborations = this.getAllCollaborations();
    const sharedWithUser = collaborations.filter(collab => 
      collab.sharedWith.includes(userId) && collab.sharedBy !== userId
    );

    sharedWithUser.forEach(collab => {
      const sharedBy = this.getUserById(collab.sharedBy);
      notifications.push({
        id: `share_${collab.templateId}`,
        type: 'share' as const,
        title: 'Template compartilhado',
        message: `${sharedBy?.name || 'Usuário'} compartilhou um template com você`,
        createdAt: collab.sharedAt,
        read: false,
        actionUrl: `/templates/${collab.templateId}`
      });
    });

    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Funções auxiliares
  private static getAllCollaborations(): TemplateCollaboration[] {
    try {
      const stored = localStorage.getItem(this.COLLABORATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter colaborações:', error);
      return [];
    }
  }

  private static getAllComments(): TemplateComment[] {
    try {
      const stored = localStorage.getItem(this.COMMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter comentários:', error);
      return [];
    }
  }

  private static getAllWorkspaces(): TeamWorkspace[] {
    try {
      const stored = localStorage.getItem(this.WORKSPACES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter workspaces:', error);
      return [];
    }
  }

  private static getAllActivities(): CollaborationActivity[] {
    try {
      const stored = localStorage.getItem(this.ACTIVITIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao obter atividades:', error);
      return [];
    }
  }

  private static getDefaultUsers(): User[] {
    return [
      {
        id: 'default_user',
        name: 'Administrador RSV',
        email: 'admin@rsv360.com.br',
        role: 'admin',
        department: 'Administração',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: {
          canCreateTemplates: true,
          canEditTemplates: true,
          canDeleteTemplates: true,
          canShareTemplates: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true
        }
      },
      {
        id: 'user_vendas',
        name: 'Equipe Vendas',
        email: 'vendas@rsv360.com.br',
        role: 'editor',
        department: 'Vendas',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: {
          canCreateTemplates: true,
          canEditTemplates: true,
          canDeleteTemplates: false,
          canShareTemplates: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: false
        }
      },
      {
        id: 'user_marketing',
        name: 'Equipe Marketing',
        email: 'marketing@rsv360.com.br',
        role: 'editor',
        department: 'Marketing',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: {
          canCreateTemplates: true,
          canEditTemplates: true,
          canDeleteTemplates: false,
          canShareTemplates: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: false
        }
      }
    ];
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CollaborationManager;
