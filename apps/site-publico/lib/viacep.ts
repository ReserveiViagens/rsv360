/**
 * Integração com API ViaCEP para busca de endereço por CEP
 * https://viacep.com.br/
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressFromCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

/**
 * Busca endereço por CEP usando API ViaCEP
 * @param cep - CEP no formato 00000-000 ou 00000000
 * @returns Endereço formatado ou null se não encontrado
 */
export async function fetchAddressByCep(cep: string): Promise<AddressFromCep | null> {
  try {
    // Limpar CEP (remover caracteres não numéricos)
    const cleanCep = cep.replace(/\D/g, '');
    
    // Validar formato (deve ter 8 dígitos)
    if (cleanCep.length !== 8) {
      return null;
    }

    // Buscar na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCepResponse = await response.json();

    // Verificar se CEP foi encontrado
    if (data.erro) {
      return null;
    }

    // Formatar CEP com hífen
    const formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;

    // Retornar endereço formatado
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: formattedCep,
      complement: data.complemento || undefined,
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

/**
 * Valida formato de CEP
 * @param cep - CEP a validar
 * @returns true se válido
 */
export function isValidCep(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.length === 8;
}

