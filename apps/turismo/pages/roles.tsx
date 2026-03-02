'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Save,
  X,
  CheckCircle,
  XCircle,
  Users,
  Key,
  Settings,
  FileText,
  BarChart3,
  Lock,
  Unlock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  permissionCount: number
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  name: string
  category: string
  description: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get('/api/v1/roles', { params: { search: searchTerm || undefined } }),
        api.get('/api/v1/roles/permissions/available')
      ])
      
      setRoles(rolesRes.data?.data || [])
      setPermissions(permissionsRes.data?.data || [])
    } catch (error) {
      console.error('Erro ao carregar funções:', error)
      toast.error('Erro ao carregar funções')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '_')
      }

      if (selectedRole) {
        await api.put(`/api/v1/roles/${selectedRole.id}`, payload)
        toast.success('Função atualizada com sucesso!')
      } else {
        await api.post('/api/v1/roles', payload)
        toast.success('Função criada com sucesso!')
      }

      setShowForm(false)
      setSelectedRole(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar função:', error)
      toast.error('Erro ao salvar função')
    }
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta função?')) return

    try {
      await api.delete(`/api/v1/roles/${id}`)
      toast.success('Função excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir função:', error)
      toast.error('Erro ao excluir função')
    }
  }

  const handleView = (role: Role) => {
    setSelectedRole(role)
    setShowModal(true)
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      permissions: []
    })
  }

  const getPermissionCategory = (category: string) => {
    const categories: Record<string, string> = {
      'Usuários': 'bg-blue-100 text-blue-800',
      'Relatórios': 'bg-green-100 text-green-800',
      'Financeiro': 'bg-purple-100 text-purple-800',
      'Configurações': 'bg-orange-100 text-orange-800'
    }
    return categories[category] || 'bg-gray-100 text-gray-800'
  }

  const filteredRoles = roles.filter(role => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      role.name.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower) ||
      role.id.toLowerCase().includes(searchLower)
    )
  })

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Funções</h1>
                <p className="mt-2 text-gray-600">
                  Gerencie funções e suas permissões no sistema
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowForm(true)
                    setSelectedRole(null)
                    resetForm()
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Função
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Busca */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar funções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Lista de Funções */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma função encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece criando uma nova função.'}
                </p>
              </div>
            ) : (
              filteredRoles.map(role => (
                <div key={role.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        {role.isSystem && (
                          <span className="text-xs text-gray-500">Sistema</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Key className="w-4 h-4 mr-1" />
                        {role.permissionCount} permissões
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {role.userCount} usuários
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(role)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(role)}
                      disabled={role.isSystem}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      disabled={role.isSystem}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de Visualização */}
        {showModal && selectedRole && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Função</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRole(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedRole.name}</h4>
                  <p className="text-sm text-gray-500">{selectedRole.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p className="text-sm text-gray-900">{selectedRole.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <p className="text-sm text-gray-900">{selectedRole.isSystem ? 'Sistema' : 'Personalizada'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Permissões</p>
                    <p className="text-sm text-gray-900">{selectedRole.permissionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Usuários</p>
                    <p className="text-sm text-gray-900">{selectedRole.userCount}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Permissões</p>
                  <div className="space-y-2">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => {
                      const categoryPerms = perms.filter(p => selectedRole.permissions.includes(p.id))
                      if (categoryPerms.length === 0) return null
                      return (
                        <div key={category}>
                          <p className="text-xs font-medium text-gray-700 mb-1">{category}</p>
                          <div className="flex flex-wrap gap-2">
                            {categoryPerms.map(perm => (
                              <span key={perm.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {perm.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRole(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedRole ? 'Editar Função' : 'Nova Função'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedRole(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="admin"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Administrador"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição da função"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissões ({formData.permissions.length} selecionadas)</label>
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">{category}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${getPermissionCategory(category)}`}>
                            {perms.filter(p => formData.permissions.includes(p.id)).length} / {perms.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perms.map(perm => (
                            <label
                              key={perm.id}
                              className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                                <p className="text-xs text-gray-500">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedRole(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {selectedRole ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
