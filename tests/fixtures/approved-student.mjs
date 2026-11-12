// Isolated Supabase fixture for browser QA. Account state persists across local pages.
export async function approvedStudent(context, profileOverride={}, registeredAlumni=false){
 await context.route("https://esm.sh/@supabase/supabase-js@*",route=>route.fulfill({
  contentType:"application/javascript",
  headers:{"Access-Control-Allow-Origin":"*"},
  body: String.raw`export const createClient=()=>{
   const key="__qa_supabase_storage_v2";
   function database(){try{return JSON.parse(localStorage.getItem(key)||"{}");}catch{return {};}}
   function save(db){localStorage.setItem(key,JSON.stringify(db));}
   const user={id:"fixture",email:"student@example.test"};
   const profileOverride=${JSON.stringify(profileOverride)};
   const registeredAlumni=${JSON.stringify(registeredAlumni)};
   function from(table){
    let mode="select",where=[],ordering=null,max=1000,values=null;
    const match=(row)=>where.every(([type,k,v])=>{
     const x=row[k];if(type==="eq")return x===v;
     if(type==="gte")return x>=v;if(type==="lte")return x<=v;
     if(type==="lt")return x<v;if(type==="neq")return x!==v;return true;
    });
    function execute(){
     if(table==="profiles")return {data:[{user_id:user.id,full_name:"Student",approval_status:"approved",enrollment_status:"enrolled",signup_type:"student",...profileOverride}].filter(match),error:null};
     const db=database(),rows=db[table]||[];
     if(mode==="delete"){db[table]=rows.filter(row=>!match(row));save(db);return {data:[],error:null};}
     if(mode==="update"){
      const updated=rows.map(row=>match(row)?{...row,...values}:row);
      db[table]=updated;save(db);return {data:updated.filter(match),error:null};
     }
     let data=rows.filter(match);
     if(ordering){const [col,ascending]=ordering;data=data.slice().sort((a,b)=>(String(a[col]||"").localeCompare(String(b[col]||"")))*(ascending?1:-1));}
     return {data:data.slice(0,max),error:null};
    }
    const builder={
     select(){mode="select";return this;},
     eq(k,v){where.push(["eq",k,v]);return this;},
     gte(k,v){where.push(["gte",k,v]);return this;},
     lte(k,v){where.push(["lte",k,v]);return this;},
     lt(k,v){where.push(["lt",k,v]);return this;},
     neq(k,v){where.push(["neq",k,v]);return this;},
     order(k,options={}){ordering=[k,options.ascending!==false];return this;},
     limit(n){max=n;return this;},
     range(a,b){max=b-a+1;return this;},
     delete(){mode="delete";return this;},
     update(row){mode="update";values=row;return this;},
     upsert(items){return this.insert(items,true);},
     insert(items,merge=false){
      const db=database(),rows=db[table]||[];
      for(const original of (Array.isArray(items)?items:[items])){
       const row={...original};
       if(table==="personal_tasks"){
        row.id??="fixture-task-"+Date.now()+"-"+Math.random();
        row.status??="open";row.created_at??=new Date().toISOString();
       }
       if(table==="user_favorites")row.created_at??=new Date().toISOString();
       const keys={user_favorites:["user_id","service_id"],user_recent_services:["user_id","service_id"],
        daily_task_checks:["user_id","task_date","task_key"],user_preferences:["user_id"]}[table];
       const old=merge&&keys?rows.findIndex(r=>keys.every(k=>r[k]===row[k])):-1;
       if(old>=0)rows[old]={...rows[old],...row};else rows.push(row);
      }
      db[table]=rows;save(db);return Promise.resolve({data:[],error:null});
     },
     maybeSingle(){const result=execute();return Promise.resolve({...result,data:result.data[0]||null});},
     then(resolve,reject){return Promise.resolve(execute()).then(resolve,reject);}
    };
    return builder;
   }
   return {
    auth:{
     onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},
     async getUser(){return {data:{user}};},
     async getSession(){return {data:{session:{access_token:"fixture-token"}},error:null};},
     async signOut(){return {error:null};},
     async signInWithPassword(){return {error:null};}
    },
    from,
    functions:{async invoke(){return {data:{ok:false,error:"ADMIN_NOT_AUTHORIZED"},error:null};}},
    async rpc(name){return {data:({start_portal_session:new Date(Date.now()+90*86400000).toISOString(),
     portal_learning_access:{read:true,write:true},portal_super_admin_allowed:false,my_alumni_profile_registered:registeredAlumni})[name]};}
   };
  };`
 }));
}
