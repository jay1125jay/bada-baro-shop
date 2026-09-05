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

function setText(id,value){
  const el=document.getElementById(id);
  if(el&&value!==undefined&&value!==null)el.textContent=String(value);
}

function setLines(id,value,withSeal=false){
  const el=document.getElementById(id);
  if(!el||value===undefined||value===null)return;
  el.innerHTML=String(value).split('|').map(escapeHtml).join('<br>')+(withSeal?'<span>海</span>':'');
}

function safeCssUrl(value){
  return String(value||'').replace(/["'()\\\n\r]/g,'');
}

function applySettings(s){
  if(!s)return;
  setText('topbarText',s.topbar_text);
  setText('heroEyebrow',s.hero_eyebrow);
  setLines('heroTitle',s.hero_title);
  setLines('heroDescription',s.hero_description);
  setLines('heroNote',s.hero_note,true);
  setText('promise1Title',s.promise1_title);setText('promise1Text',s.promise1_text);
  setText('promise2Title',s.promise2_title);setText('promise2Text',s.promise2_text);
  setText('promise3Title',s.promise3_title);setText('promise3Text',s.promise3_text);
  setText('promise4Title',s.promise4_title);setText('promise4Text',s.promise4_text);
  setText('productsKicker',s.products_kicker);setText('productsTitle',s.products_title);setText('productsSubtitle',s.products_subtitle);
  if(s.hero_background_url)document.documentElement.style.setProperty('--hero-bg',`url("${safeCssUrl(s.hero_background_url)}")`);
  if(s.hero_product_url)document.documentElement.style.setProperty('--hero-product',`url("${safeCssUrl(s.hero_product_url)}")`);
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

async function loadSettings(){
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*&id=eq.1`,{headers:{apikey:SUPABASE_KEY}});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const rows=await res.json();
    if(Array.isArray(rows)&&rows[0])applySettings(rows[0]);
  }catch(err){console.error('사이트 설정 DB 연결 실패:',err)}
}

loadSettings();
loadProducts();
