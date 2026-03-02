export const mockProperty = {
  id: 1,
  name: 'Propriedade Teste',
  base_price_per_night: 250,
  location: 'Caldas Novas, GO',
};

export const mockForecast = {
  property_id: 1,
  start_date: '2025-12-20',
  end_date: '2025-12-30',
  current_price: 250,
  forecast: [
    {
      date: '2025-12-20',
      predicted_price: 275,
      confidence: 0.85,
      recommendation: 'increase',
    },
  ],
};
