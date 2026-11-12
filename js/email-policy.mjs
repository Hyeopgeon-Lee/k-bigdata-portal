// Signup-only email domain policy. Existing accounts can continue logging in.
export function isRestrictedSignupEmail(email){
 const normalized=String(email??"").trim().toLowerCase();
 const at=normalized.lastIndexOf("@");
 if(at<0)return false;
 const domain=normalized.slice(at+1);
 return domain==="kopo.ac.kr"||domain.endsWith(".kopo.ac.kr");
}
