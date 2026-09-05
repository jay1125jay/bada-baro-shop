const SUPABASE_URL='https://zkkgmvscwbrxhuwuwfbf.supabase.co';
const SUPABASE_KEY=['sb','publishable','q0MF3aAt5384TBLHhS3kxQ','ygmjqp','P'].join('_');

const DEFAULT_PRODUCTS=[
  {name:'자숙 대게 (프리미엄)',desc:'살이 꽉 찬 프리미엄 대게',price:'₩89,000~',badge:'BEST',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Jasuk-daege.jpg'},
  {name:'자숙 홍게',desc:'부드럽고 깊은 풍미의 홍게',price:'₩49,000~',badge:'신상품',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Boiled_Echizen_crab_(snow_crab)_male_and_female.jpg'},
  {name:'대게+홍게 세트',desc:'대게와 홍게를 한 번에 즐기는 구성',price:'₩129,000~',badge:'추천',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seafood_crabs_legs_shrimp_food.jpg'},
  {name:'대게 다리살 (자숙)',desc:'간편하게 즐기는 대게 다리살',price:'₩59,000~',badge:'인기',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Frozen_Snow_Crab_Legs.jpg'}
];

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

function renderProducts(products){
  const grid=document.getElementById('productGrid');
  if(!grid)return;
  grid.innerHTML='';
  products.forEach((p,i)=>{
    const fallback=DEFAULT_PRODUCTS[i%DEFAULT_PRODUCTS.length].image;
    const image=p.image_url||p.image||fallback;
    const card=document.createElement('article');
    card.className='product-card';
    const media=`<div class="product-media"><img src="${image}" alt="${escapeHtml(p.name)}"></div>`;
    card.innerHTML=`${p.badge?`<span class="product-badge">${escapeHtml(p.badge)}</span>`:''}${media}<div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||p.desc||'')}</p><div class="product-price">${escapeHtml(p.price)}</div></div>`;
    grid.appendChild(card);
  });
}

async function loadProducts(){
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,sort_order,name,description,price,badge,image_url&is_active=eq.true&order=sort_order.asc`,{headers:{apikey:SUPABASE_KEY}});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const products=await res.json();
    renderProducts(Array.isArray(products)&&products.length?products:DEFAULT_PRODUCTS);
  }catch(err){
    console.error('상품 DB 연결 실패:',err);
    renderProducts(DEFAULT_PRODUCTS);
  }
}

loadProducts();
