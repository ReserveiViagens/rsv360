/**
 * Componente de Gerenciamento de Criptografia
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Lock, 
  Key, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface EncryptionKey {
  id: string;
  type: string;
  algorithm: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
}

export function EncryptionManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [encryptData, setEncryptData] = useState('');
  const [encryptAlgorithm, setEncryptAlgorithm] = useState('aes-256-gcm');
  const [encryptedResult, setEncryptedResult] = useState<any>(null);
  const [decryptData, setDecryptData] = useState('');
  const [decryptResult, setDecryptResult] = useState<string>('');
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [keysToRotate, setKeysToRotate] = useState<string[]>([]);

  useEffect(() => {
    loadKeys();
    checkRotation();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await fetch('/api/encryption/keys');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setKeys(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
    }
  };

  const checkRotation = async () => {
    try {
      const response = await fetch('/api/encryption/keys/rotation-check', {
        method: 'PUT',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setKeysToRotate(data.data.keysToRotate);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar rotação:', error);
    }
  };

  const handleEncrypt = async () => {
    if (!encryptData) {
      toast({
        title: 'Erro',
        description: 'Digite os dados para criptografar',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/encryption/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: encryptData,
          algorithm: encryptAlgorithm,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEncryptedResult(data.data);
          toast({
            title: 'Criptografia concluída',
            description: 'Dados criptografados com sucesso',
          });
        }
      } else {
        throw new Error('Erro ao criptografar');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criptografar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptData) {
      toast({
        title: 'Erro',
        description: 'Cole os dados criptografados',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const encryptedData = JSON.parse(decryptData);
      const response = await fetch('/api/encryption/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encrypted_data: encryptedData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDecryptResult(data.data.decrypted);
          setShowDecrypted(true);
          toast({
            title: 'Descriptografia concluída',
            description: 'Dados descriptografados com sucesso',
          });
        }
      } else {
        throw new Error('Erro ao descriptografar');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao descriptografar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keyId: string) => {
    if (!confirm(`Tem certeza que deseja rotacionar a chave "${keyId}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/encryption/keys/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId }),
      });

      if (response.ok) {
        toast({
          title: 'Chave rotacionada',
          description: 'Nova chave criada com sucesso',
        });
        await loadKeys();
        await checkRotation();
      } else {
        throw new Error('Erro ao rotacionar chave');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao rotacionar chave',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas de rotação */}
      {keysToRotate.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Chaves precisam ser rotacionadas</AlertTitle>
          <AlertDescription>
            {keysToRotate.length} chave(s) precisam ser rotacionadas em breve.
          </AlertDescription>
        </Alert>
      )}

      {/* Chaves de Criptografia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Chaves de Criptografia
          </CardTitle>
          <CardDescription>
            Gerencie as chaves de criptografia do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma chave encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{key.id}</span>
                        <Badge variant="outline">{key.type}</Badge>
                        <Badge variant="outline">{key.algorithm}</Badge>
                        {key.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                        {keysToRotate.includes(key.id) && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Rotacionar
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Criada em: {new Date(key.createdAt).toLocaleString('pt-BR')}</p>
                        {key.expiresAt && (
                          <p>Expira em: {new Date(key.expiresAt).toLocaleString('pt-BR')}</p>
                        )}
                        <p>Uso: {key.usageCount.toLocaleString()} vezes</p>
                        {key.lastUsed && (
                          <p>Último uso: {new Date(key.lastUsed).toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    {key.isActive && (
                      <Button
                        onClick={() => handleRotateKey(key.id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Rotacionar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Criptografar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Criptografar Dados
          </CardTitle>
          <CardDescription>
            Criptografe dados sensíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="encrypt-algorithm">Algoritmo</Label>
            <Select
              value={encryptAlgorithm}
              onValueChange={setEncryptAlgorithm}
            >
              <SelectTrigger id="encrypt-algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aes-256-gcm">AES-256-GCM (Recomendado)</SelectItem>
                <SelectItem value="aes-256-cbc">AES-256-CBC</SelectItem>
                <SelectItem value="chacha20-poly1305">ChaCha20-Poly1305</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="encrypt-data">Dados para Criptografar</Label>
            <Textarea
              id="encrypt-data"
              value={encryptData}
              onChange={(e) => setEncryptData(e.target.value)}
              placeholder="Digite os dados sensíveis aqui..."
              rows={4}
            />
          </div>
          <Button onClick={handleEncrypt} disabled={loading || !encryptData}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Criptografar
          </Button>

          {encryptedResult && (
            <div className="p-4 bg-muted rounded-lg">
              <Label>Resultado Criptografado (JSON)</Label>
              <Textarea
                value={JSON.stringify(encryptedResult, null, 2)}
                readOnly
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descriptografar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Descriptografar Dados
          </CardTitle>
          <CardDescription>
            Descriptografe dados criptografados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="decrypt-data">Dados Criptografados (JSON)</Label>
            <Textarea
              id="decrypt-data"
              value={decryptData}
              onChange={(e) => setDecryptData(e.target.value)}
              placeholder='{"encrypted":"...","iv":"...","tag":"...","algorithm":"aes-256-gcm","keyId":"default"}'
              rows={6}
              className="font-mono text-xs"
            />
          </div>
          <Button onClick={handleDecrypt} disabled={loading || !decryptData}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Descriptografar
          </Button>

          {decryptResult && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label>Resultado Descriptografado</Label>
                <Button
                  onClick={() => setShowDecrypted(!showDecrypted)}
                  size="sm"
                  variant="ghost"
                >
                  {showDecrypted ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Textarea
                value={showDecrypted ? decryptResult : '••••••••'}
                readOnly
                rows={4}
                className="font-mono text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

