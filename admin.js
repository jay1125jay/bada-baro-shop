const SUPABASE_URL='https://zkkgmvscwbrxhuwuwfbf.supabase.co';
const SUPABASE_KEY=['sb','publishable','q0MF3aAt5384TBLHhS3kxQ','ygmjqp','P'].join('_');
const ADMIN_EMAIL='bada.baroshop@gmail.com';
let accessToken=sessionStorage.getItem('badaAdminToken')||'';
let products=[];

const grid=document.getElementById('editorGrid');
const loginPanel=document.getElementById('loginPanel');
const adminPanel=document.getElementById('adminPanel');
const statusEl=document.getElementById('status');

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function setStatus(msg,isError=false){statusEl.textContent=msg;statusEl.className=isError?'status error':'status'}
function authHeaders(extra={}){return {apikey:SUPABASE_KEY,Authorization:`Bearer ${accessToken}`,...extra}}

async function signIn(){
  const email=ADMIN_EMAIL;
  const password=document.getElementById('password').value;
  if(!password){setStatus('비밀번호를 입력하세요.',true);return}
  setStatus('로그인 중...');
  const res=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const data=await res.json();
  if(!res.ok){setStatus(data.msg||data.error_description||'비밀번호를 확인하세요.',true);return}
  accessToken=data.access_token;
  sessionStorage.setItem('badaAdminToken',accessToken);
  await showAdmin();
}

async function setupAdmin(){
  const email=ADMIN_EMAIL;
  const password=document.getElementById('password').value;
  if(password.length<8){setStatus('새 관리자 비밀번호를 8자 이상 입력하세요.',true);return}
  setStatus('관리자 계정 설정 중...');
  const res=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const data=await res.json();
  if(!res.ok){setStatus(data.msg||data.error_description||'관리자 설정에 실패했습니다.',true);return}
  if(!data.access_token){setStatus('관리자 세션 생성에 실패했습니다.',true);return}
  accessToken=data.access_token;
  sessionStorage.setItem('badaAdminToken',accessToken);
  await showAdmin();
}

async function loadProducts(){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,sort_order,name,description,price,badge,image_url,is_active&order=sort_order.asc`,{headers:authHeaders()});
  if(res.status===401){logout();return}
  if(!res.ok)throw new Error(`상품 조회 실패 ${res.status}`);
  products=await res.json();
  render();
}

function render(){
  grid.innerHTML='';
  products.forEach((p,i)=>{
    const card=document.createElement('section');
    card.className='card';
    card.innerHTML=`<h2>상품 ${i+1}</h2><div class="preview">${p.image_url?`<img src="${p.image_url}" alt="미리보기">`:'사진 미등록'}</div><div class="field"><label>상품명</label><input data-k="name" data-i="${i}" value="${esc(p.name)}"></div><div class="field"><label>설명</label><textarea data-k="description" data-i="${i}">${esc(p.description||'')}</textarea></div><div class="field"><label>가격</label><input data-k="price" data-i="${i}" value="${esc(p.price)}"></div><div class="field"><label>배지</label><input data-k="badge" data-i="${i}" value="${esc(p.badge||'')}"></div><div class="field"><label>상품 사진</label><input type="file" accept="image/jpeg,image/png,image/webp" data-file="${i}"></div>`;
    grid.appendChild(card);
  });
  bind();
}

function bind(){
  document.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('input',e=>{products[+e.target.dataset.i][e.target.dataset.k]=e.target.value}));
  document.querySelectorAll('[data-file]').forEach(el=>el.addEventListener('change',async e=>{
    const i=+e.target.dataset.file;
    const f=e.target.files?.[0];
    if(!f)return;
    if(f.size>5*1024*1024){alert('이미지는 5MB 이하로 올려주세요.');e.target.value='';return}
    try{
      setStatus('사진 업로드 중...');
      const ext=(f.name.split('.').pop()||'jpg').toLowerCase();
      const path=`product-${products[i].id}-${Date.now()}.${ext}`;
      const res=await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${encodeURIComponent(path)}`,{method:'POST',headers:authHeaders({'Content-Type':f.type||'image/jpeg'}),body:f});
      if(!res.ok)throw new Error(`업로드 실패 ${res.status}`);
      products[i].image_url=`${SUPABASE_URL}/storage/v1/object/public/product-images/${encodeURIComponent(path)}`;
      render();
      setStatus('사진 업로드 완료. 전체 저장을 누르면 상품에 반영됩니다.');
    }catch(err){setStatus(err.message,true)}
  }));
}

async function saveAll(){
  try{
    setStatus('저장 중...');
    for(const p of products){
      const body={name:p.name,description:p.description||'',price:p.price,badge:p.badge||'',image_url:p.image_url||'',sort_order:p.sort_order,is_active:p.is_active!==false,updated_at:new Date().toISOString()};
      const res=await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`,{method:'PATCH',headers:authHeaders({'Content-Type':'application/json','Prefer':'return=minimal'}),body:JSON.stringify(body)});
      if(!res.ok)throw new Error(`상품 ${p.id} 저장 실패 ${res.status}`);
    }
    setStatus('저장 완료. 실제 사이트에 바로 반영됩니다.');
  }catch(err){setStatus(err.message,true)}
}

async function showAdmin(){
  loginPanel.hidden=true;
  adminPanel.hidden=false;
  setStatus('관리자 연결 확인 중...');
  try{await loadProducts();setStatus('Supabase DB 연결됨.')}catch(err){setStatus(err.message,true)}
}

function logout(){accessToken='';sessionStorage.removeItem('badaAdminToken');loginPanel.hidden=false;adminPanel.hidden=true;setStatus('로그아웃되었습니다.');}

document.getElementById('loginBtn').onclick=signIn;
const setupBtn=document.getElementById('setupBtn');
if(setupBtn)setupBtn.onclick=setupAdmin;
document.getElementById('saveBtn').onclick=saveAll;
document.getElementById('logoutBtn').onclick=logout;
document.getElementById('password').addEventListener('keydown',e=>{if(e.key==='Enter')signIn()});

if(accessToken)showAdmin();
