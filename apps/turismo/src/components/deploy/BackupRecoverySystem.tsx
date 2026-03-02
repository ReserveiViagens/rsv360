import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Download, Upload, Clock, CheckCircle, AlertTriangle, Settings, Plus, Eye, Trash2, Database, HardDrive, Cloud, Shield } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal, Textarea, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

// Interfaces
interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  size: number;
  createdAt: string;
  completedAt?: string;
  retention: number; // dias
  location: 'local' | 'cloud' | 'both';
}

interface RecoveryPoint {
  id: string;
  backupId: string;
  timestamp: string;
  size: number;
  status: 'available' | 'corrupted' | 'expired';
  checksum: string;
  location: string;
}

interface BackupRecoverySystemProps {
  onBackupStarted?: (job: BackupJob) => void;
  onBackupCompleted?: (job: BackupJob) => void;
  onRecoveryStarted?: (point: RecoveryPoint) => void;
}

// Mock data
const mockBackupJobs: BackupJob[] = [
  {
    id: '1',
    name: 'Backup Diário - Banco de Dados',
    type: 'full',
    status: 'completed',
    size: 2.5,
    createdAt: '2024-01-15T02:00:00Z',
    completedAt: '2024-01-15T02:15:00Z',
    retention: 30,
    location: 'both'
  },
  {
    id: '2',
    name: 'Backup Incremental - Aplicação',
    type: 'incremental',
    status: 'running',
    size: 0.8,
    createdAt: '2024-01-15T10:00:00Z',
    retention: 7,
    location: 'cloud'
  }
];

const mockRecoveryPoints: RecoveryPoint[] = [
  {
    id: '1',
    backupId: '1',
    timestamp: '2024-01-15T02:15:00Z',
    size: 2.5,
    status: 'available',
    checksum: 'abc123...',
    location: '/backups/db_20240115_020000.tar.gz'
  }
];

const BackupRecoverySystem: React.FC<BackupRecoverySystemProps> = ({
  onBackupStarted,
  onBackupCompleted,
  onRecoveryStarted
}) => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>(mockBackupJobs);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>(mockRecoveryPoints);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [newBackup, setNewBackup] = useState<Partial<BackupJob>>({});
  const { showNotification } = useUIStore();

  const handleCreateBackup = () => {
    if (newBackup.name && newBackup.type) {
      const job: BackupJob = {
        id: Date.now().toString(),
        name: newBackup.name,
        type: newBackup.type as 'full' | 'incremental' | 'differential',
        status: 'pending',
        size: 0,
        createdAt: new Date().toISOString(),
        retention: newBackup.retention || 30,
        location: newBackup.location || 'local'
      };

      setBackupJobs(prev => [...prev, job]);
      setNewBackup({});
      setShowBackupModal(false);
      onBackupStarted?.(job);
      showNotification('Backup agendado!', 'success');
    }
  };

  const handleStartRecovery = (point: RecoveryPoint) => {
    onRecoveryStarted?.(point);
    showNotification('Recuperação iniciada!', 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Backup e Recuperação</h2>
          <p className="text-gray-600">Gerencie backups e recuperação do sistema RSV</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowBackupModal(true)}>
            <Save className="w-4 h-4 mr-2" />
            Novo Backup
          </Button>
          <Button onClick={() => setShowRecoveryModal(true)} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Recuperar
          </Button>
        </div>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="recovery">Recuperação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Save className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Backups</p>
                    <p className="text-2xl font-bold text-gray-900">{backupJobs.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Backups Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {backupJobs.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Espaço Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {backupJobs.reduce((acc, b) => acc + b.size, 0).toFixed(1)} GB
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Backups Recentes</h3>
              <div className="space-y-3">
                {backupJobs.slice(0, 3).map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.name}</h4>
                        <p className="text-sm text-gray-600">
                          {job.type} • {job.size} GB • {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backups" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Jobs de Backup</h3>
                <Button onClick={() => setShowBackupModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Backup
                </Button>
              </div>

              <div className="space-y-4">
                {backupJobs.map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.name}</h4>
                        <p className="text-sm text-gray-600">
                          Tipo: {job.type} • Retenção: {job.retention} dias • Local: {job.location}
                        </p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Tamanho:</strong> {job.size} GB</p>
                      <p><strong>Criado:</strong> {new Date(job.createdAt).toLocaleString()}</p>
                      {job.completedAt && (
                        <p><strong>Concluído:</strong> {new Date(job.completedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pontos de Recuperação</h3>
              
              <div className="space-y-4">
                {recoveryPoints.map(point => (
                  <Card key={point.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Backup {new Date(point.timestamp).toLocaleString()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tamanho: {point.size} GB • Checksum: {point.checksum}
                        </p>
                      </div>
                      <Badge className={getStatusColor(point.status)}>
                        {point.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Local:</strong> {point.location}</p>
                      <p><strong>Status:</strong> {point.status}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleStartRecovery(point)}
                        disabled={point.status !== 'available'}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Recuperar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal de Backup */}
      <Modal open={showBackupModal} onOpenChange={setShowBackupModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Job de Backup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input
                placeholder="Ex: Backup Diário - Banco"
                value={newBackup.name || ''}
                onChange={(e) => setNewBackup(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <Select
                value={newBackup.type || ''}
                onValueChange={(value) => setNewBackup(prev => ({ ...prev, type: value }))}
              >
                <option value="">Selecione o tipo</option>
                <option value="full">Completo</option>
                <option value="incremental">Incremental</option>
                <option value="differential">Diferencial</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retenção (dias)</label>
              <Input
                type="number"
                placeholder="30"
                value={newBackup.retention || ''}
                onChange={(e) => setNewBackup(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
              <Select
                value={newBackup.location || ''}
                onValueChange={(value) => setNewBackup(prev => ({ ...prev, location: value }))}
              >
                <option value="">Selecione o local</option>
                <option value="local">Local</option>
                <option value="cloud">Cloud</option>
                <option value="both">Ambos</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowBackupModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBackup}>
                <Save className="w-4 h-4 mr-2" />
                Criar Backup
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Recuperação */}
      <Modal open={showRecoveryModal} onOpenChange={setShowRecoveryModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Iniciar Recuperação</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ponto de Recuperação</label>
              <Select>
                <option value="">Selecione um backup</option>
                {recoveryPoints.filter(p => p.status === 'available').map(point => (
                  <option key={point.id} value={point.id}>
                    {new Date(point.timestamp).toLocaleString()} ({point.size} GB)
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowRecoveryModal(false)}>
                Cancelar
              </Button>
              <Button>
                <RotateCcw className="w-4 h-4 mr-2" />
                Iniciar Recuperação
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { BackupRecoverySystem };
export type { BackupJob, RecoveryPoint, BackupRecoverySystemProps };
