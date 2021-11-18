import { test } from 'tap';
import build from '../build/app';

test('requests the "/" route', async (t) => {
  const app = build();

  const response = await app.inject({
    method: 'GET',
    url: '/',
  });
  t.strictEqual(response.statusCode, 404, 'returns a status code of 400');
});
