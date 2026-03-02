// Centralizador de exportações para componentes de segurança

export { default as SecurityCenter } from './SecurityCenter'
export { default as ComplianceManager } from './ComplianceManager'
export { default as AccessControlManager } from './AccessControlManager'
export { default as AuditSystem } from './AuditSystem'
export { default as DataProtectionCenter } from './DataProtectionCenter'

// Tipos relacionados a segurança
export type SecurityModule = 
  | 'security-center'
  | 'compliance-manager'
  | 'access-control'
  | 'audit-system'
  | 'data-protection'

export interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  incidentsOpen: number
  complianceScore: number
  vulnerabilities: number
  lastScan: string
  securityScore: number
}

export interface SecurityAlert {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  category: 'authentication' | 'authorization' | 'data-breach' | 'malware' | 'network' | 'compliance'
  status: 'open' | 'investigating' | 'resolved' | 'false-positive'
  description: string
  affectedSystems: string[]
  recommendedActions: string[]
}

export interface ComplianceFramework {
  id: string
  name: string
  description: string
  score: number
  requirements: number
  compliantRequirements: number
  lastAudit: string
  nextAudit: string
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending-review'
}

export interface AccessPolicy {
  id: string
  name: string
  description: string
  type: 'rbac' | 'abac' | 'custom'
  isActive: boolean
  rules: {
    resource: string
    action: string
    condition?: string
    effect: 'allow' | 'deny'
  }[]
  assignedUsers: number
  assignedRoles: number
  lastModified: string
  createdBy: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  userId?: string
  userName?: string
  action: string
  resource: string
  outcome: 'success' | 'failure' | 'blocked'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ipAddress: string
  userAgent?: string
  location?: string
  metadata: Record<string, any>
}

export interface DataAsset {
  id: string
  name: string
  type: 'database' | 'file' | 'api' | 'service'
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  encryptionStatus: 'encrypted' | 'unencrypted' | 'partial'
  owner: string
  lastAccessed: string
  size: number
  location: string
  riskScore: number
  complianceFrameworks: string[]
  sensitiveDataTypes: string[]
}

export interface PrivacyRequest {
  id: string
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestorId: string
  requestorName: string
  submittedAt: string
  estimatedCompletion?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  affectedAssets: string[]
}

// Constantes de segurança
export const SECURITY_MODULES = [
  'security-center',
  'compliance-manager', 
  'access-control',
  'audit-system',
  'data-protection'
] as const

export const THREAT_LEVELS = [
  'low',
  'medium', 
  'high',
  'critical'
] as const

export const ALERT_SEVERITIES = [
  'low',
  'medium',
  'high', 
  'critical'
] as const

export const COMPLIANCE_STATUS = [
  'compliant',
  'partial',
  'non-compliant',
  'pending-review'
] as const

export const ACCESS_POLICY_TYPES = [
  'rbac',
  'abac',
  'custom'
] as const

export const DATA_CLASSIFICATIONS = [
  'public',
  'internal',
  'confidential',
  'restricted'
] as const

export const PRIVACY_REQUEST_TYPES = [
  'access',
  'portability',
  'rectification',
  'erasure',
  'restriction',
  'objection'
] as const
