export function withPropertyFilter(query: any, propertyId: number | undefined): any {
  if (propertyId) {
    return query.where('property_id', propertyId);
  }
  return query;
}

export function injectPropertyId(data: any, propertyId: number | undefined): any {
  if (propertyId) {
    return { ...data, property_id: propertyId };
  }
  return data;
}

export function filterByProperty<T extends { property_id?: number }>(items: T[], propertyId: number | undefined): T[] {
  if (!propertyId) return items;
  return items.filter((item) => !item.property_id || Number(item.property_id) === Number(propertyId));
}
