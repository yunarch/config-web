// Fixture: native MSW direct import — :param gets converted to {param}
import { http, HttpResponse } from 'msw';

export const getUserById = http.get('/api/users/:id', () => {
  return HttpResponse.json({ id: 1, name: 'John' });
});
