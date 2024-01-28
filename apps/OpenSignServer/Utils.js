export function customAPIurl() {
  const url = new URL(process.env.SERVER_URL);
  return url.pathname === '/api/app' ? url.origin + '/api' : url.origin;
}
