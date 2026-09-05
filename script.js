const DEFAULT_PRODUCTS=[{name:'자숙 대게 (프리미엄)',desc:'살이 꽉 찬 프리미엄 대게',price:'₩89,000~',badge:'BEST',image:''},{name:'자숙 홍게',desc:'부드럽고 깊은 풍미의 홍게',price:'₩49,000~',badge:'추천',image:''},{name:'대게+홍게 세트',desc:'대게와 홍게를 한 번에 즐기는 구성',price:'₩129,000~',badge:'SET',image:''},{name:'대게 다리살 (자숙)',desc:'간편하게 즐기는 대게 다리살',price:'₩59,000~',badge:'NEW',image:''}];

function getProducts(){
  try{
    const saved=localStorage.getItem('badaProducts');
    const parsed=saved?JSON.parse(saved):null;
    return Array.isArray(parsed)&&parsed.length?parsed:DEFAULT_PRODUCTS;
  }catch(e){return DEFAULT_PRODUCTS;}
}

function renderProducts(){
  const grid=document.getElementById('productGrid');
  if(!grid)return;
  grid.innerHTML='';
  getProducts().forEach((p)=>{
    const card=document.createElement('article');
    card.className='product-card';
    const media=p.image?`<div class="product-media"><img src="${p.image}" alt="${escapeHtml(p.name)}"></div>`:`<div class="product-media"><div class="product-placeholder" aria-hidden="true"></div></div>`;
    card.innerHTML=`${p.badge?`<span class="product-badge">${escapeHtml(p.badge)}</span>`:''}${media}<div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p><div class="product-price">${escapeHtml(p.price)}</div></div>`;
    grid.appendChild(card);
  });
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

renderProducts();

if(location.hostname==='localhost'||location.protocol==='file:'){
  const a=document.createElement('a');
  a.href='admin.html';
  a.className='admin-link';
  a.textContent='관리자';
  document.body.appendChild(a);
}
