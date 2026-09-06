(()=>{
  const SUPABASE_URL='https://zkkgmvscwbrxhuwuwfbf.supabase.co';
  const SUPABASE_KEY=['sb','publishable','q0MF3aAt5384TBLHhS3kxQ','ygmjqp','P'].join('_');
  if(!window.supabase?.createClient)return;
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.BADA_AUTH=client;
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    try{
      const url=typeof input==='string'?input:input?.url||'';
      if(url.includes('/rest/v1/rpc/create_order')){
        const {data}=await client.auth.getSession();
        const token=data?.session?.access_token;
        if(token){
          const headers=new Headers(init.headers||{});
          headers.set('Authorization',`Bearer ${token}`);
          init={...init,headers};
        }
      }
    }catch(e){console.warn('Auth order bridge:',e)}
    return nativeFetch(input,init);
  };

  const $=id=>document.getElementById(id);
  const modal=$('customerAuthModal'),trigger=$('customerAuthTrigger'),guest=$('authGuest'),profile=$('authProfile');
  const open=()=>{if(modal){modal.hidden=false;document.body.classList.add('modal-open')}};
  const close=()=>{if(modal){modal.hidden=true;if(!document.querySelector('.modal:not([hidden])'))document.body.classList.remove('modal-open')}};
  async function social(provider){
    const redirectTo=location.origin+location.pathname;
    const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo}});
    if(error)alert(`${provider==='google'?'구글':'카카오'} 로그인을 시작하지 못했습니다. 관리자 설정을 확인해주세요.`);
  }
  function nameOf(user){return user?.user_metadata?.full_name||user?.user_metadata?.name||user?.user_metadata?.nickname||user?.email?.split('@')[0]||'회원'}
  function paint(session){
    const user=session?.user;
    if(trigger){trigger.classList.toggle('is-signed-in',!!user);trigger.setAttribute('aria-label',user?'마이페이지':'로그인');const label=trigger.querySelector('.auth-label');if(label)label.textContent=user?nameOf(user):'로그인'}
    if(guest)guest.style.display=user?'none':'block';
    if(profile){profile.classList.toggle('is-active',!!user);if(user){$('authProfileName').textContent=nameOf(user);$('authProfileEmail').textContent=user.email||'소셜 계정';}}
  }
  async function loadOrders(){
    const target=$('authOrdersResult');if(!target)return;
    target.innerHTML='주문내역을 불러오는 중...';
    const {data,error}=await client.from('orders').select('order_no,total_amount,order_status,payment_status,created_at').order('created_at',{ascending:false}).limit(10);
    if(error){target.textContent='주문내역을 불러오지 못했습니다.';return}
    if(!data?.length){target.textContent='아직 연결된 주문내역이 없습니다.';return}
    target.innerHTML=data.map(o=>`<div class="auth-order-row"><strong>${o.order_no}</strong><span>₩${Number(o.total_amount||0).toLocaleString('ko-KR')} · ${o.order_status} · ${new Date(o.created_at).toLocaleDateString('ko-KR')}</span></div>`).join('');
  }
  trigger?.addEventListener('click',open);
  $('authClose')?.addEventListener('click',close);
  modal?.querySelector('.auth-backdrop')?.addEventListener('click',close);
  $('googleLoginBtn')?.addEventListener('click',()=>social('google'));
  $('kakaoLoginBtn')?.addEventListener('click',()=>social('kakao'));
  $('authLogoutBtn')?.addEventListener('click',async()=>{await client.auth.signOut();close()});
  $('authOrdersBtn')?.addEventListener('click',loadOrders);
  client.auth.getSession().then(({data})=>paint(data.session));
  client.auth.onAuthStateChange((_event,session)=>paint(session));
})();