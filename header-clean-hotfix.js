// Compatibility fix for simplified header without nav/search/cart controls.
function updateCartCount(){
  const el=document.getElementById('cartCount');
  if(el) el.textContent=cart.reduce((sum,item)=>sum+item.quantity,0);
}

(function restoreStorefront(){
  const postcodeBtn=document.getElementById('postcodeBtn');
  if(postcodeBtn) postcodeBtn.onclick=openPostcode;

  const placeOrderBtn=document.getElementById('placeOrderBtn');
  if(placeOrderBtn) placeOrderBtn.onclick=createOrder;

  const kakao=document.getElementById('kakaoInquiry');
  if(kakao){
    kakao.onclick=()=>{
      const url=String(siteSettings.kakao_url||'').trim();
      if(!url){
        alert('카카오 상담 링크가 아직 등록되지 않았습니다. 관리자 페이지에서 카카오 채널 또는 오픈채팅 링크를 등록해주세요.');
        return;
      }
      window.open(url,'_blank','noopener');
    };
  }

  const search=document.getElementById('productSearch');
  if(search){
    search.addEventListener('input',e=>{
      const q=e.target.value.trim().toLowerCase();
      filteredProducts=q?products.filter(p=>(p.name+' '+(p.description||'')+' '+(p.origin||'')).toLowerCase().includes(q)):[...products];
      renderProducts();
    });
  }

  Promise.all([loadSettings(),loadProducts()]);
})();
