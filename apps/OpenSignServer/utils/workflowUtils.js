// Workflow helpers for placeholder/audit-trail processing. These helpers
// are intentionally agnostic of any role classification — they treat every
// non-prefill placeholder as a participant, and only the 'Signed' activity
// counts toward completion. Builds with role-aware behaviour layer extra
// filtering on top.

// Audit-trail activities that mark a placeholder as having fulfilled its
// completion duty.
export const COMPLETION_ACTIVITIES = ['Signed'];

// A placeholder participates in completion unless it is a prefill entry
// (which only pre-populates field values without acting on the document).
export function isParticipantBasic(placeholder) {
  return placeholder?.Role !== 'prefill';
}

// A placeholder participates in completion unless it is a prefill entry or a viewer.
export function isCompletionRelevant(placeholder) {
  if (!isParticipantBasic(placeholder)) return false;
  return true;
}

// Locate a placeholder index by signerObjId. Prefill placeholders are
// excluded so caller indices stay aligned with the participant list.
export function findPlaceholderIndex(placeholders, signerObjId) {
  if (!Array.isArray(placeholders) || !signerObjId) return -1;
  return placeholders.findIndex(
    p => (p?.signerObjId || p?.signerPtr?.objectId) === signerObjId && p?.Role !== 'prefill'
  );
}

// Strict-order gating: returns the signerObjId of the prior placeholder
// still pending, or null when the strict-order requirement is satisfied.
export function findPendingPriorSigner(placeholders, idx, auditTrail) {
  if (!Array.isArray(placeholders) || idx <= 0) return null;
  const trail = Array.isArray(auditTrail) ? auditTrail : [];
  for (let i = 0; i < idx; i++) {
    const ph = placeholders[i];
    if (!isCompletionRelevant(ph)) continue;
    const signerObjId = ph?.signerObjId || ph?.signerPtr?.objectId;
    if (!signerObjId) continue;
    const acted = trail.some(
      a => a?.UserPtr?.objectId === signerObjId && COMPLETION_ACTIVITIES.includes(a?.Activity)
    );
    if (!acted) return signerObjId;
  }
  return null;
}
