// Shared, side-effect-free student eligibility rules for examination reminders.
export const CERTIFICATE_CODES = Object.freeze(['engineer','industrial','sqld']);
export const REGISTRATION_KINDS = Object.freeze(['written_registration','practical_registration','registration']);
export function eligibleProfile(profile) {
  return !!profile && profile.approval_status==='approved' &&
    profile.enrollment_status==='enrolled' && profile.signup_type==='student' &&
    typeof profile.email==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
}
export function shouldNotify(registrations, certificateCode, eventType) {
  if(!CERTIFICATE_CODES.includes(certificateCode) || !REGISTRATION_KINDS.includes(eventType))return false;
  const active=(registrations||[]).filter(row=>row.certificate_code===certificateCode && row.verification_status!=='rejected');
  const written=active.some(row=>row.pass_status==='written');
  const final=active.some(row=>row.pass_status==='final');
  if(final)return false;
  if(certificateCode==='sqld')return eventType==='registration';
  if(eventType==='written_registration')return !written;
  if(eventType==='practical_registration')return written;
  return false;
}
