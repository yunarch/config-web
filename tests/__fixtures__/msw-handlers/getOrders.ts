// Fixture: native MSW aliased import (http as mswHttp)
import { HttpResponse, http as mswHttp } from 'msw';

export const getOrders = mswHttp.get('/api/orders', () => {
  return HttpResponse.json([]);
});
