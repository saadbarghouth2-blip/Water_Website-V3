const PRODUCTS = [
  { id:1, title:"مياه 330 مل", slug:"bottle-330", category:"bottle", price:3, rating:4.4, stock:120, img:"images.jpeg", desc:"زجاجة مياه 330 مل نقية" },
  { id:2, title:"مياه 600 مل", slug:"bottle-600", category:"bottle", price:4, rating:4.7, stock:200, img:"images (1).jpeg", desc:"زجاجة 600 مل مناسبة للترطيب" },
  { id:3, title:"مياه 1.5 لتر", slug:"bottle-1-5", category:"bottle", price:6, rating:4.9, stock:150, img:"images (2).jpeg", desc:"زجاجة 1.5 لتر عائلية" },
  { id:4, title:"كرتونة 6 × 330 مل", slug:"pack-6", category:"pack", price:15, rating:4.5, stock:80, img:"images (3).jpeg", desc:"كرتونة اقتصادية صغيرة" },
  { id:5, title:"كرتونة 12 × 1.5 لتر", slug:"pack-12", category:"pack", price:55, rating:4.6, stock:50, img:"images (4).jpeg", desc:"عرض توفير 12 عبوة 1.5 لتر" },
  { id:6, title:"جالون 19 لتر", slug:"gallon-19", category:"gallon", price:25, rating:4.2, stock:40, img:"images (5).jpeg", desc:"جالون 19 لتر مع موزع" },
  { id:7, title:"مياه فوارة 330 مل", slug:"spark-330", category:"sparkling", price:7, rating:4.3, stock:70, img:"images (6).jpeg", desc:"مياه فوارة منعشة" },
  { id:8, title:"مياه فوارة 600 مل", slug:"spark-600", category:"sparkling", price:10, rating:4.1, stock:90, img:"images (7).jpeg", desc:"فوارة 600 مل" },
  { id:9, title:"مياه نكهات طبيعية", slug:"flavored", category:"bottle", price:12, rating:4.0, stock:60, img:"images (8).jpeg", desc:"نكهات طبيعية بدون سكر" },
  { id:10, title:"موزع مياه مكتبي", slug:"dispenser", category:"gallon", price:350, rating:4.8, stock:15, img:"images (9).jpeg", desc:"موزع مياه للمكاتب" }
];

// حالة الموقع
let CART = JSON.parse(localStorage.getItem('CART_V1') || '[]');
let ORDERS = JSON.parse(localStorage.getItem('ORDERS_V1') || '[]');

// عناصر DOM
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const downloadJsonBtn = document.getElementById('downloadJson');

const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const catsButtons = document.querySelectorAll('.cats button');

// عرض المنتجات
function renderProducts(list = PRODUCTS){
  productsGrid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}">
      <div class="prod-head">
        <div class="prod-title">${escapeHtml(p.title)}</div>
        <div class="prod-stock">${p.stock} متوفر</div>
      </div>
      <div class="prod-desc">${escapeHtml(p.desc)}</div>
      <div class="prod-bottom">
        <div>
          <div class="price">${p.price} ج.م</div>
          <div class="muted">⭐ ${p.rating}</div>
        </div>
        <div>
          <button class="btn" onclick='addToCartById(${p.id})'>أضف للسلة</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// فلترة وبحث
function filterAndSearch(){
  const q = (searchInput.value || '').toLowerCase().trim();
  const cat = filterSelect.value;
  let filtered = PRODUCTS.filter(p=>{
    const matchesQ = p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    const matchesCat = (cat === 'all') ? true : p.category === cat;
    return matchesQ && matchesCat;
  });
  renderProducts(filtered);
}

// إضافة للسلة
function addToCartById(id){
  const product = PRODUCTS.find(p=>p.id===id);
  if(!product) return;
  const exist = CART.find(i=>i.id===id);
  if(exist){
    if(exist.qty < product.stock) exist.qty++;
    else alert('وصلت للحد الأقصى للمخزون');
  } else {
    CART.push({ id:product.id, title:product.title, price:product.price, img:product.img, qty:1 });
  }
  saveCart();
  openCart();
  renderSidebarCart();
}

// حفظ السلة
function saveCart(){
  localStorage.setItem('CART_V1', JSON.stringify(CART));
  updateCartCount();
}

// تحديث عداد السلة
function updateCartCount(){
  const count = CART.reduce((s,i)=>s+i.qty,0);
  cartCount.innerText = count;
}

// رندر السلة الجانبية
function renderSidebarCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  CART.forEach((it, idx)=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${escapeHtml(it.title)}">
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(it.title)}</div>
        <div class="muted">${it.qty} × ${it.price} ج.م</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button onclick="incQty(${idx})" class="btn alt">+</button>
        <button onclick="decQty(${idx})" class="btn alt">-</button>
        <button onclick="removeItem(${idx})" class="btn alt" style="background:var(--danger);color:#fff">حذف</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
    total += it.qty * it.price;
  });
  cartTotalEl.innerText = total;
  cartCount.innerText = CART.reduce((s,i)=>s+i.qty,0);
}

// تعديل كميات
function incQty(i){
  const it = CART[i];
  const prod = PRODUCTS.find(p=>p.id===it.id);
  if(it.qty < prod.stock) it.qty++;
  saveCart(); renderSidebarCart();
}
function decQty(i){
  CART[i].qty--;
  if(CART[i].qty <= 0) CART.splice(i,1);
  saveCart(); renderSidebarCart();
}
function removeItem(i){
  CART.splice(i,1); saveCart(); renderSidebarCart();
}
function clearCart(){
  if(!confirm('هل تريد تفريغ السلة؟')) return;
  CART = []; saveCart(); renderSidebarCart();
}

// فتح السلة
function openCart(){ cartSidebar.classList.add('open'); }
function closeCartFn(){ cartSidebar.classList.remove('open'); }

// checkout
function openCheckout(){ checkoutModal.setAttribute('aria-hidden','false'); }
function closeCheckoutFn(){ checkoutModal.setAttribute('aria-hidden','true'); }

// إرسال الطلب
checkoutForm && checkoutForm.addEventListener('submit', function(e){
  e.preventDefault();
  const fd = new FormData(checkoutForm);
  const order = {
    id: 'ORD'+Date.now(),
    createdAt: new Date().toISOString(),
    customer: {
      name: fd.get('name'),
      phone: fd.get('phone'),
      address: fd.get('address'),
      notes: fd.get('notes'),
      payment: fd.get('payment')
    },
    items: CART,
    total: CART.reduce((s,i)=>s + i.qty * i.price, 0)
  };
  ORDERS.push(order);
  localStorage.setItem('ORDERS_V1', JSON.stringify(ORDERS));
  alert('تم إنشاء الطلب بنجاح. الرقم: ' + order.id);
  CART = []; saveCart(); renderSidebarCart(); closeCheckoutFn();
});

// تنزيل JSON للطلب الحالي
downloadJsonBtn && downloadJsonBtn.addEventListener('click', ()=>{
  const payload = { items:CART, total:CART.reduce((s,i)=>s + i.qty*i.price,0), ts: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'order_payload.json'; a.click(); URL.revokeObjectURL(url);
});

// Utility functions
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]}); }

// search / filter events
searchInput && searchInput.addEventListener('input', debounce(filterAndSearch, 300));
filterSelect && filterSelect.addEventListener('change', filterAndSearch);
catsButtons.forEach(b=>b.addEventListener('click', ()=>{ filterSelect.value = b.dataset.cat; filterAndSearch(); }));

// cart buttons
cartBtn && cartBtn.addEventListener('click', openCart);
closeCart && closeCart.addEventListener('click', closeCartFn);
clearCartBtn && clearCartBtn.addEventListener('click', clearCart);
checkoutBtn && checkoutBtn.addEventListener('click', ()=>{ if(CART.length===0){ alert('السلة فارغة'); return } openCheckout(); });
closeCheckout && closeCheckout.addEventListener('click', closeCheckoutFn);

// timer للعرض
(function startTimer(){
  const deadline = Date.now() + 24*60*60*1000; // 24 ساعة
  const el = document.getElementById('dealTimer');
  const t = setInterval(()=>{
    const now = Date.now();
    const diff = Math.max(0, deadline - now);
    const h = Math.floor(diff / (1000*60*60));
    const m = Math.floor((diff % (1000*60*60)) / (1000*60));
    const s = Math.floor((diff % (1000*60)) / 1000);
    if(el) el.innerText = `${h}h ${m}m ${s}s`;
    if(diff<=0) clearInterval(t);
  }, 1000);
})();

// init stats and render
function init(){
  renderProducts(PRODUCTS);
  renderSidebarCart();
  updateCartCount();
  document.getElementById('statCustomers').innerText = 2000;
  document.getElementById('statOrders').innerText = ORDERS.length || 5000;
}
init();

// debounce helper
function debounce(fn, wait){ let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); } }
