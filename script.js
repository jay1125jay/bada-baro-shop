const DEFAULT_PRODUCTS=[
  {name:'자숙 대게 (프리미엄)',desc:'살이 꽉 찬 프리미엄 대게',price:'₩89,000~',badge:'BEST',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Jasuk-daege.jpg'},
  {name:'자숙 홍게',desc:'부드럽고 깊은 풍미의 홍게',price:'₩49,000~',badge:'신상품',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Boiled_Echizen_crab_(snow_crab)_male_and_female.jpg'},
  {name:'대게+홍게 세트',desc:'대게와 홍게를 한 번에 즐기는 구성',price:'₩129,000~',badge:'추천',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seafood_crabs_legs_shrimp_food.jpg'},
  {name:'대게 다리살 (자숙)',desc:'간편하게 즐기는 대게 다리살',price:'₩59,000~',badge:'인기',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Frozen_Snow_Crab_Legs.jpg'}
];

function getProducts(){
  try{
    const saved=localStorage.getItem('badaProducts');
    const parsed=saved?JSON.parse(saved):null;
    return Array.isArray(parsed)&&parsed.length?parsed:DEFAULT_PRODUCTS;
  }catch(e){return DEFAULT_PRODUCTS;}
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

function renderProducts(){
  const grid=document.getElementById('productGrid');
  if(!grid)return;
  grid.innerHTML='';
  getProducts().forEach((p,i)=>{
    const fallback=DEFAULT_PRODUCTS[i%DEFAULT_PRODUCTS.length].image;
    const card=document.createElement('article');
    card.className='product-card';
    const media=`<div class="product-media"><img src="${p.image||fallback}" alt="${escapeHtml(p.name)}"></div>`;
    card.innerHTML=`${p.badge?`<span class="product-badge">${escapeHtml(p.badge)}</span>`:''}${media}<div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p><div class="product-price">${escapeHtml(p.price)}</div></div>`;
    grid.appendChild(card);
  });
}

async function loadOfficialLogo(){
  const logo=document.getElementById('officialLogo');
  if(!logo)return;
  try{
    const res=await fetch('official-logo.base64.txt?v=20260905-approved',{cache:'no-store'});
    if(!res.ok)throw new Error('logo');
    const b64=(await res.text()).trim();
    if(!b64)throw new Error('logo');
    logo.src=`data:image/jpeg;base64,${b64}`;
  }catch(e){logo.alt='바다에서바로';}
}

renderProducts();
loadOfficialLogo();
