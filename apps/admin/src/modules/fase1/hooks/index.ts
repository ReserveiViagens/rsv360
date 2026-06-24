import { useQuery } from '@tanstack/react-query';
import { fase1AdminApi, type Fase1ModuleKey } from '../api/fase1.api';

export function useFase1ModuleList(module: Fase1ModuleKey) {
  return useQuery({
    queryKey: ['fase1', module],
    queryFn: () => fase1AdminApi.list(module),
  });
}

export function useFase1Health(module: Fase1ModuleKey) {
  return useQuery({
    queryKey: ['fase1', module, 'health'],
    queryFn: () => fase1AdminApi.health(module),
  });
}
