export async function approvedStudent(context){
  await context.route("https://esm.sh/@supabase/supabase-js@*",route=>route.fulfill({
    contentType:"application/javascript",
    headers:{"Access-Control-Allow-Origin":"*"},
    body:`export const createClient=()=>({
      auth:{onAuthStateChange(){},async getUser(){return {data:{user:{id:"fixture",email:"student@example.test"}}};}},
      from(){return {select(){return this;},eq(){return this;},order(){return this;},limit(){return Promise.resolve({data:[],error:null});},maybeSingle(){return {data:{full_name:"Student",approval_status:"approved",enrollment_status:"enrolled"}};}};},
      async rpc(name){return {data:({start_portal_session:new Date(Date.now()+86400000).toISOString(),portal_learning_access:{read:true,write:true},portal_super_admin_allowed:false})[name]};}
    });`
  }));
}
