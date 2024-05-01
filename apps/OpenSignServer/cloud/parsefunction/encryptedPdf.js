import { PostHog } from 'posthog-node';
const ph_project_api_key = process.env.PH_PROJECT_API_KEY;
const client = new PostHog(ph_project_api_key);
export default async function encryptedpdf(request) {
  const email = request.params.email;
  if (client) {
    client?.capture({
      distinctId: email,
      event: 'encrypted_pdf_error',
      properties: { response_code: 200 },
    });
  }
  return { message: 'success' };
}
