import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Upload, 
  X, 
  Plus, 
  Trash2,
  Save,
  Eye,
  Download
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

// Schema de validação para o formulário
const customerSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF deve ter no máximo 14 caracteres'),
  }),
  address: z.object({
    street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
    city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
    state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
    zipCode: z.string().min(5, 'CEP deve ter pelo menos 5 caracteres'),
    country: z.string().min(2, 'País deve ter pelo menos 2 caracteres'),
  }),
  preferences: z.array(z.object({
    id: z.string(),
    category: z.enum(['destination', 'accommodation', 'transport', 'activities']),
    value: z.string().min(1, 'Valor da preferência é obrigatório'),
    priority: z.enum(['low', 'medium', 'high']),
  })),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'vip']),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  customer?: Partial<CustomerFormData>;
  mode: 'create' | 'edit';
}

const categoryOptions: SelectOption[] = [
  { value: 'destination', label: 'Destino' },
  { value: 'accommodation', label: 'Hospedagem' },
  { value: 'transport', label: 'Transporte' },
  { value: 'activities', label: 'Atividades' },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const statusOptions: SelectOption[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'vip', label: 'VIP' },
];

const stateOptions: SelectOption[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer,
  mode
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newPreference, setNewPreference] = useState({
    category: 'destination' as const,
    value: '',
    priority: 'medium' as const,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        cpf: '',
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
      },
      preferences: [],
      notes: '',
      tags: [],
      status: 'active',
      ...customer,
    },
  });

  const watchedTags = watch('tags') || [];
  const watchedPreferences = watch('preferences') || [];

  useEffect(() => {
    if (isOpen && customer) {
      reset(customer);
    }
  }, [isOpen, customer, reset]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addPreference = () => {
    if (newPreference.value.trim()) {
      const newPref = {
        id: Date.now().toString(),
        ...newPreference,
        value: newPreference.value.trim(),
      };
      setValue('preferences', [...watchedPreferences, newPref]);
      setNewPreference({
        category: 'destination',
        value: '',
        priority: 'medium',
      });
    }
  };

  const removePreference = (id: string) => {
    setValue('preferences', watchedPreferences.filter(pref => pref.id !== id));
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      // Aqui você pode adicionar lógica para upload dos arquivos
      console.log('Dados do cliente:', data);
      console.log('Arquivos para upload:', uploadedFiles);
      
      await onSave(data);
      onClose();
      reset();
      setUploadedFiles([]);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
      size="4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informações Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="personalInfo.firstName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nome"
                  placeholder="Digite o nome"
                  {...field}
                  error={errors.personalInfo?.firstName?.message}
                  icon={<User className="w-4 h-4" />}
                />
              )}
            />
            
            <Controller
              name="personalInfo.lastName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Sobrenome"
                  placeholder="Digite o sobrenome"
                  {...field}
                  error={errors.personalInfo?.lastName?.message}
                />
              )}
            />
            
            <Controller
              name="personalInfo.email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  type="email"
                  placeholder="Digite o email"
                  {...field}
                  error={errors.personalInfo?.email?.message}
                  icon={<Mail className="w-4 h-4" />}
                />
              )}
            />
            
            <Controller
              name="personalInfo.phone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Telefone"
                  placeholder="Digite o telefone"
                  {...field}
                  error={errors.personalInfo?.phone?.message}
                  icon={<Phone className="w-4 h-4" />}
                />
              )}
            />
            
            <Controller
              name="personalInfo.birthDate"
              control={control}
              render={({ field }) => (
                <Input
                  label="Data de Nascimento"
                  type="date"
                  {...field}
                  error={errors.personalInfo?.birthDate?.message}
                  icon={<Calendar className="w-4 h-4" />}
                />
              )}
            />
            
            <Controller
              name="personalInfo.cpf"
              control={control}
              render={({ field }) => (
                <Input
                  label="CPF"
                  placeholder="Digite o CPF"
                  {...field}
                  error={errors.personalInfo?.cpf?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Endereço
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="address.street"
              control={control}
              render={({ field }) => (
                <Input
                  label="Rua"
                  placeholder="Digite o endereço"
                  {...field}
                  error={errors.address?.street?.message}
                  icon={<MapPin className="w-4 h-4" />}
                />
              )}
            />
            
            <Controller
              name="address.city"
              control={control}
              render={({ field }) => (
                <Input
                  label="Cidade"
                  placeholder="Digite a cidade"
                  {...field}
                  error={errors.address?.city?.message}
                />
              )}
            />
            
            <Controller
              name="address.state"
              control={control}
              render={({ field }) => (
                <Select
                  label="Estado"
                  options={stateOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.address?.state?.message}
                />
              )}
            />
            
            <Controller
              name="address.zipCode"
              control={control}
              render={({ field }) => (
                <Input
                  label="CEP"
                  placeholder="Digite o CEP"
                  {...field}
                  error={errors.address?.zipCode?.message}
                />
              )}
            />
            
            <Controller
              name="address.country"
              control={control}
              render={({ field }) => (
                <Input
                  label="País"
                  placeholder="Digite o país"
                  {...field}
                  error={errors.address?.country?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Preferências */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Preferências de Viagem
          </h3>
          
          <div className="space-y-3">
            {watchedPreferences.map((preference) => (
              <div key={preference.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Badge variant="outline">{preference.category}</Badge>
                <span className="flex-1 font-medium">{preference.value}</span>
                <Badge variant={preference.priority === 'high' ? 'error' : preference.priority === 'medium' ? 'warning' : 'default'}>
                  {preference.priority}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePreference(preference.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg">
              <Select
                options={categoryOptions}
                value={newPreference.category}
                onChange={(value) => setNewPreference(prev => ({ ...prev, category: value as any }))}
                className="w-32"
              />
              <Input
                placeholder="Digite a preferência"
                value={newPreference.value}
                onChange={(e) => setNewPreference(prev => ({ ...prev, value: e.target.value }))}
                className="flex-1"
              />
              <Select
                options={priorityOptions}
                value={newPreference.priority}
                onChange={(value) => setNewPreference(prev => ({ ...prev, priority: value as any }))}
                className="w-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPreference}
                disabled={!newPreference.value.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upload de Documentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Documentos
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Selecionar arquivos</span>
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Arquivos selecionados:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags e Anotações */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Tags e Anotações
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Digite uma tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center space-x-1">
                      <span>{tag}</span>
                                             <button
                         type="button"
                         onClick={() => removeTag(tag)}
                         className="ml-1 hover:text-red-600"
                         title={`Remover tag ${tag}`}
                       >
                         <X className="w-3 h-3" />
                       </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anotações</label>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite anotações sobre o cliente..."
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Status do Cliente</h3>
          
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { CustomerModal };
export type { CustomerFormData, CustomerModalProps };
