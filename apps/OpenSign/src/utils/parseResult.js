export function normalizeParseObjectResult(result) {
  if (result?.id || !result?.objectId) return result;
  return { ...result, id: result.objectId };
}
