const SUPABASE_URL='https://zkkgmvscwbrxhuwuwfbf.supabase.co';
const SUPABASE_KEY=['sb','publishable','q0MF3aAt5384TBLHhS3kxQ','ygmjqp','P'].join('_');
const RPC=`${SUPABASE_URL}/rest/v1/rpc`;
const UPLOAD_URL=`${SUPABASE_URL}/functions/v1/admin-upload`;
let adminToken=sessionStorage.getItem('badaCustomAdminToken')||'';
let products=[];
let siteSettings=null;
let orders=[];

const grid=document.getElementById('editorGrid');
const ordersGrid=document.getElementById('ordersGrid');
const loginPanel=document.getElementById('loginPanel');
const adminPanel=document.getElementById('adminPanel');
const statusEl=document.getElementById('status');
const loginBtn=document.getElementById('loginBtn');
const setupBtn=document.getElementById('setupBtn');
const loginTitle=document.getElementById('loginTitle');
const loginNotice=document.getElementById('loginNotice');
const passwordEl=document.getElementById('password');

const settingsFields={
  topbar_text:'topbarText',hero_eyebrow:'heroEyebrow',hero_title:'heroTitle',hero_description:'heroDescription',hero_note:'heroNote',
  promise1_title:'promise1Title',promise1_text:'promise1Text',promise2_title:'promise2Title',promise2_text:'promise2Text',
  promise3_title:'promise3Title',promise3_text:'promise3Text',promise4_title:'promise4Title',promise4_text:'promise4Text',
  products_kicker:'productsKicker',products_title:'productsTitle',products_subtitle:'productsSubtitle',
  kakao_url:'kakaoUrl',bank_name:'bankName',bank_account:'bankAccount',bank_holder:'bankHolder',shipping_fee:'shippingFee'
};

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function money(v){return `₩${Number(v||0).toLocaleString('ko-KR')}`}
function setStatus(msg,isError=false){statusEl.textContent=msg;statusEl.className=isError?'status error':'status'}
async function rpc(name,body={}){
  const res=await fetch(`${RPC}/${name}`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  let data=null;try{data=await res.json()}catch(e){}
  if(!res.ok)throw new Error(data?.message||data?.error||`요청 실패 ${res.status}`);return data;
}

async function detectMode(){
  try{
    if(adminToken){const valid=await rpc('admin_session_valid',{p_token:adminToken});if(valid){await showAdmin();return}sessionStorage.removeItem('badaCustomAdminToken');adminToken=''}
    const initialized=await rpc('admin_is_initialized');
    if(initialized){loginTitle.textContent='관리자 로그인';loginBtn.hidden=false;setupBtn.hidden=true;loginNotice.textContent='관리자 비밀번호로 로그인합니다.';setStatus('관리자 비밀번호를 입력하세요.')}
    else{loginTitle.textContent='관리자 비밀번호 등록';loginBtn.hidden=true;setupBtn.hidden=false;loginNotice.textContent='처음 한 번만 사용할 관리자 비밀번호를 등록하세요.';setStatus('처음 사용할 관리자 비밀번호를 등록하세요.')}
  }catch(err){setStatus(`관리자 상태 확인 실패: ${err.message}`,true)}
}
async function initializeAdmin(){const password=passwordEl.value;if(password.length<8){setStatus('비밀번호는 8자 이상으로 입력하세요.',true);return}try{setStatus('관리자 비밀번호 등록 중...');const ok=await rpc('admin_initialize',{p_password:password});if(!ok){setStatus('이미 관리자 비밀번호가 등록되어 있습니다. 로그인하세요.',true);await detectMode();return}await loginWithPassword(password)}catch(err){setStatus(err.message,true)}}
async function signIn(){const password=passwordEl.value;if(!password){setStatus('비밀번호를 입력하세요.',true);return}await loginWithPassword(password)}
async function loginWithPassword(password){try{setStatus('로그인 중...');const token=await rpc('admin_login',{p_password:password});if(!token){setStatus('비밀번호가 맞지 않습니다.',true);return}adminToken=token;sessionStorage.setItem('badaCustomAdminToken',adminToken);passwordEl.value='';await showAdmin()}catch(err){setStatus(err.message,true)}}

async function loadProducts(){products=await rpc('admin_products',{p_token:adminToken});products=(products||[]).map(p=>({...p,price_amount:Number(p.price_amount)||Number(String(p.price||'').replace(/\D/g,''))||0}));renderProducts()}
async function loadSiteSettings(){siteSettings=await rpc('admin_site_settings',{p_token:adminToken});renderSettings()}
async function loadOrders(){orders=await rpc('admin_orders',{p_token:adminToken});renderOrders()}

function renderSettings(){
  if(!siteSettings)return;
  Object.entries(settingsFields).forEach(([key,id])=>{const el=document.getElementById(id);if(el)el.value=siteSettings[key]??''});
  renderImagePreview('heroBackgroundPreview',siteSettings.hero_background_url);renderImagePreview('heroProductPreview',siteSettings.hero_product_url);
}
function renderImagePreview(id,url){const el=document.getElementById(id);if(!el)return;el.innerHTML=url?`<img src="${url}" alt="미리보기">`:'사진 미등록'}
function collectSettings(){Object.entries(settingsFields).forEach(([key,id])=>{const el=document.getElementById(id);if(el)siteSettings[key]=key==='shipping_fee'?Math.max(0,Number(el.value)||0):el.value})}

function renderProducts(){
  grid.innerHTML='';
  products.forEach((p,i)=>{
    const card=document.createElement('section');card.className='card';
    card.innerHTML=`<h2>상품 ${i+1}</h2><div class="preview">${p.image_url?`<img src="${p.image_url}" alt="미리보기">`:'사진 미등록'}</div>
      <div class="field"><label>상품명</label><input data-k="name" data-i="${i}" value="${esc(p.name)}"></div>
      <div class="field"><label>상품 설명</label><textarea data-k="description" data-i="${i}">${esc(p.description||'')}</textarea></div>
      <div class="field"><label>화면 표시 가격</label><input data-k="price" data-i="${i}" value="${esc(p.price)}"><div class="small-help">예: ₩89,000~</div></div>
      <div class="field"><label>실제 주문 금액 (원)</label><input type="number" min="0" step="100" data-k="price_amount" data-i="${i}" value="${Number(p.price_amount)||0}"><div class="small-help">주문 합계 계산에 사용됩니다.</div></div>
      <div class="field"><label>배지</label><input data-k="badge" data-i="${i}" value="${esc(p.badge||'')}"></div>
      <div class="field"><label>상품 사진</label><input type="file" accept="image/jpeg,image/png,image/webp" data-file="${i}"></div>`;
    grid.appendChild(card);
  });bindProductFields();
}
function bindProductFields(){
  document.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('input',e=>{const key=e.target.dataset.k;products[+e.target.dataset.i][key]=key==='price_amount'?Math.max(0,Number(e.target.value)||0):e.target.value}));
  document.querySelectorAll('[data-file]').forEach(el=>el.addEventListener('change',async e=>{const i=+e.target.dataset.file;const f=e.target.files?.[0];if(!f)return;try{products[i].image_url=await uploadImage(f);renderProducts();setStatus('상품 사진 업로드 완료. 전체 설정 저장을 누르면 반영됩니다.')}catch(err){setStatus(err.message,true)}}));
}

function renderOrders(){
  ordersGrid.innerHTML='';
  if(!orders?.length){ordersGrid.innerHTML='<div class="order-empty">아직 접수된 주문이 없습니다.</div>';return}
  orders.forEach(o=>{
    const items=Array.isArray(o.items)?o.items:[];
    const card=document.createElement('section');card.className='order-card';
    card.innerHTML=`<div class="order-top"><div><div class="order-no">${esc(o.order_no)}</div><div class="order-date">${new Date(o.created_at).toLocaleString('ko-KR')}</div></div><div class="order-price">${money(o.total_amount)}</div></div>
      <div class="order-info"><div><strong>주문자</strong> ${esc(o.customer_name)}</div><div><strong>연락처</strong> ${esc(o.phone)}</div><div style="grid-column:1/-1"><strong>배송지</strong> ${esc(o.postcode)} ${esc(o.address)} ${esc(o.address_detail||'')}</div>${o.delivery_memo?`<div style="grid-column:1/-1"><strong>배송메모</strong> ${esc(o.delivery_memo)}</div>`:''}</div>
      <div class="order-items">${items.map(i=>`${esc(i.product_name)} × ${i.quantity} · ${money(i.line_amount)}`).join('<br>')}</div>
      <div class="order-controls">
        <div class="field"><label>주문 상태</label><select data-order-status="${o.id}"><option value="new">신규</option><option value="preparing">상품 준비중</option><option value="shipping">배송중</option><option value="complete">배송완료</option><option value="cancelled">취소</option></select></div>
        <div class="field"><label>결제 상태</label><select data-payment-status="${o.id}"><option value="pending">입금대기</option><option value="paid">입금확인</option><option value="refunded">환불</option><option value="cancelled">취소</option></select></div>
        <button class="btn" type="button" data-save-order="${o.id}">상태 저장</button>
      </div>`;
    ordersGrid.appendChild(card);
    card.querySelector(`[data-order-status="${o.id}"]`).value=o.order_status||'new';card.querySelector(`[data-payment-status="${o.id}"]`).value=o.payment_status||'pending';
  });
  document.querySelectorAll('[data-save-order]').forEach(btn=>btn.onclick=()=>saveOrderStatus(Number(btn.dataset.saveOrder)));
}
async function saveOrderStatus(id){
  const orderStatus=document.querySelector(`[data-order-status="${id}"]`).value;const paymentStatus=document.querySelector(`[data-payment-status="${id}"]`).value;
  try{setStatus('주문 상태 저장 중...');const ok=await rpc('admin_update_order_status',{p_token:adminToken,p_order_id:id,p_order_status:orderStatus,p_payment_status:paymentStatus});if(!ok)throw new Error('주문 상태 저장 실패');setStatus('주문 상태가 저장되었습니다.');await loadOrders()}catch(err){setStatus(err.message,true)}
}

async function uploadImage(file){if(file.size>5*1024*1024)throw new Error('이미지는 5MB 이하로 올려주세요.');setStatus('사진 업로드 중...');const base64=await fileToBase64(file);const res=await fetch(UPLOAD_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Token':adminToken},body:JSON.stringify({filename:file.name,mime:file.type||'image/jpeg',data:base64})});const data=await res.json();if(!res.ok)throw new Error(data.error||`업로드 실패 ${res.status}`);return data.url}
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=reject;r.readAsDataURL(file)})}
function bindHeroUpload(inputId,key,previewId){const input=document.getElementById(inputId);if(!input)return;input.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{siteSettings[key]=await uploadImage(f);renderImagePreview(previewId,siteSettings[key]);setStatus('메인 사진 업로드 완료. 전체 설정 저장을 누르면 사이트에 반영됩니다.')}catch(err){setStatus(err.message,true)}})}

async function saveAll(){
  try{
    setStatus('전체 설정 저장 중...');collectSettings();const s=siteSettings;
    const settingsOk=await rpc('admin_update_store_settings',{
      p_token:adminToken,p_topbar_text:s.topbar_text,p_hero_eyebrow:s.hero_eyebrow,p_hero_title:s.hero_title,p_hero_description:s.hero_description,p_hero_note:s.hero_note,
      p_hero_background_url:s.hero_background_url,p_hero_product_url:s.hero_product_url,
      p_promise1_title:s.promise1_title,p_promise1_text:s.promise1_text,p_promise2_title:s.promise2_title,p_promise2_text:s.promise2_text,
      p_promise3_title:s.promise3_title,p_promise3_text:s.promise3_text,p_promise4_title:s.promise4_title,p_promise4_text:s.promise4_text,
      p_products_kicker:s.products_kicker,p_products_title:s.products_title,p_products_subtitle:s.products_subtitle,
      p_kakao_url:s.kakao_url||'',p_bank_name:s.bank_name||'',p_bank_account:s.bank_account||'',p_bank_holder:s.bank_holder||'',p_shipping_fee:Number(s.shipping_fee)||0
    });
    if(!settingsOk)throw new Error('판매/메인 설정 저장 실패');
    for(const p of products){
      const ok=await rpc('admin_update_product_v2',{p_token:adminToken,p_id:p.id,p_sort_order:p.sort_order,p_name:p.name,p_description:p.description||'',p_price:p.price,p_price_amount:Number(p.price_amount)||0,p_badge:p.badge||'',p_image_url:p.image_url||'',p_is_active:p.is_active!==false});
      if(!ok)throw new Error(`상품 ${p.id} 저장 실패`);
    }
    setStatus('전체 설정 저장 완료. 실제 판매 사이트에 반영됩니다.');
  }catch(err){setStatus(err.message,true)}
}

async function showAdmin(){loginPanel.hidden=true;adminPanel.hidden=false;setStatus('Supabase DB 연결 확인 중...');try{await Promise.all([loadSiteSettings(),loadProducts(),loadOrders()]);setStatus('운영 DB 연결됨. 메인 화면·상품·주문을 관리할 수 있습니다.')}catch(err){setStatus(err.message,true);await logout(false)}}
async function logout(showMessage=true){try{if(adminToken)await rpc('admin_logout',{p_token:adminToken})}catch(e){}adminToken='';sessionStorage.removeItem('badaCustomAdminToken');loginPanel.hidden=false;adminPanel.hidden=true;if(showMessage)setStatus('로그아웃되었습니다.');await detectMode()}

loginBtn.onclick=signIn;setupBtn.onclick=initializeAdmin;document.getElementById('saveBtn').onclick=saveAll;document.getElementById('logoutBtn').onclick=()=>logout(true);document.getElementById('reloadOrdersBtn').onclick=async()=>{try{setStatus('주문 새로고침 중...');await loadOrders();setStatus('주문 목록을 새로고침했습니다.')}catch(err){setStatus(err.message,true)}};
passwordEl.addEventListener('keydown',e=>{if(e.key==='Enter'){setupBtn.hidden?signIn():initializeAdmin()}});bindHeroUpload('heroBackgroundFile','hero_background_url','heroBackgroundPreview');bindHeroUpload('heroProductFile','hero_product_url','heroProductPreview');detectMode();
