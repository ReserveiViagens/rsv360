import type { BudgetItem } from '@/lib/types/budget';

/** Atualiza campo (incl. nested `details.x`) em BudgetItem com tipagem segura. */
export function patchBudgetItemField(
  item: BudgetItem,
  field: string,
  value: unknown
): BudgetItem {
  if (field.includes('.')) {
    const [parentField, childField] = field.split('.');
    const parentKey = parentField as keyof BudgetItem;
    const parentValue = item[parentKey];
    const parentObj =
      typeof parentValue === 'object' && parentValue !== null
        ? (parentValue as Record<string, unknown>)
        : {};

    return {
      ...item,
      [parentField]: {
        ...parentObj,
        [childField]: value,
      },
    } as BudgetItem;
  }

  return { ...item, [field]: value } as BudgetItem;
}
