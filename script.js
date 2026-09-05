const DEFAULT_PRODUCTS=[{name:'자숙 대게 (프리미엄)',desc:'살이 꽉 찬 프리미엄 대게',price:'₩89,000~',badge:'BEST',image:''},{name:'자숙 홍게',desc:'부드럽고 깊은 풍미의 홍게',price:'₩49,000~',badge:'추천',image:''},{name:'대게+홍게 세트',desc:'대게와 홍게를 한 번에 즐기는 구성',price:'₩129,000~',badge:'SET',image:''},{name:'대게 다리살 (자숙)',desc:'간편하게 즐기는 대게 다리살',price:'₩59,000~',badge:'NEW',image:''}];

function getProducts(){
  try{
    const saved=localStorage.getItem('badaProducts');
    const parsed=saved?JSON.parse(saved):null;
    return Array.isArray(parsed)&&parsed.length?parsed:DEFAULT_PRODUCTS;
  }catch(e){return DEFAULT_PRODUCTS;}
}

const crabPlaceholder=`<svg viewBox="0 0 220 180" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M76 88c0-30 16-52 34-52s34 22 34 52c0 28-17 48-34 48S76 116 76 88Z"/><path d="M82 65C61 47 42 47 31 59c-9 10-8 26 2 34 11 8 24 2 30-5M138 65c21-18 40-18 51-6 9 10 8 26-2 34-11 8-24 2-30-5M79 96 39 118M86 114l-32 34M141 96l40 22M134 114l32 34M95 134l-9 28M125 134l9 28"/><circle cx="98" cy="76" r="2.5" fill="currentColor"/><circle cx="122" cy="76" r="2.5" fill="currentColor"/><path d="M98 100c8 5 16 5 24 0"/></g></svg>`;

function renderProducts(){
  const grid=document.getElementById('productGrid');
  if(!grid)return;
  grid.innerHTML='';
  getProducts().forEach((p)=>{
    const card=document.createElement('article');
    card.className='product-card';
    const media=p.image?`<div class="product-media"><img src="${p.image}" alt="${escapeHtml(p.name)}"></div>`:`<div class="product-media"><div class="product-placeholder">${crabPlaceholder}</div></div>`;
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
