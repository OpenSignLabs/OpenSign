// A stand-in for bs-service-identity POST /v1/pades/sign (?format=json):
// checks the bearer token, then seals the body with `seal(pdf, query)` and answers
// like the service. Specs switch it to 503 and read the calls.
import http from 'node:http';

export const sealService = {
  token: 'bsapi-test-seal-token-0123456789abcdef',
  mode: 'ok', // 'ok' | '503'
  calls: [],
};

export function startSealService(seal) {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', async () => {
      const send = (status, obj) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      const url = new URL(req.url, 'http://x');
      if (url.pathname !== '/v1/pades/sign') return send(404, { code: 'not_found' });
      if (req.headers.authorization !== `Bearer ${sealService.token}`) {
        return send(401, { code: 'unauthorized', error: 'missing or wrong bearer token' });
      }
      if (sealService.mode === '503') return send(503, { code: 'unavailable', error: 'down' });
      const query = Object.fromEntries(url.searchParams);
      sealService.calls.push({ query });
      const n = sealService.calls.length;
      try {
        const pdf = await seal(Buffer.concat(chunks), query);
        return send(200, {
          pdf: pdf.toString('base64'),
          sig: Buffer.from(`proof-${n}`).toString('base64'),
          record_id: `rec-${n}`,
          plog_vlad: `vlad-${n}`,
          log_id: `log-${n}`,
          verification_key: 'zTestKey',
        });
      } catch (e) {
        return send(422, { code: 'sign_failed', error: e.message });
      }
    });
  });
  return new Promise(resolve =>
    server.listen(0, '127.0.0.1', () =>
      resolve({
        port: server.address().port,
        stop: () => new Promise(r => server.close(r)),
      })
    )
  );
}
