// assets/js/main.js

(function () {
    const body = document.body;
  
    ['dark', 'contrast', 'font'].forEach(key => {
      if (localStorage.getItem(key) === 'on') body.classList.add(`pref-${key}`);
      const toggle = document.getElementById(`toggle-${key}`);
      if (toggle) toggle.checked = localStorage.getItem(key) === 'on';
  
      if (toggle) toggle.addEventListener('change', () => {
        body.classList.toggle(`pref-${key}`, toggle.checked);
        localStorage.setItem(key, toggle.checked ? 'on' : 'off');
      });
    });
  })();
  
  (function () {
    const priceMap = {
      'Earl Grey Tea': 3.50,
      'Matcha Latte': 4.25,
      'Spiced Chai': 4.00,
      'Vanilla Latte': 4.50,
      'Cold Brew': 3.75,
      'Herbal Infusion': 3.25
    };
  
    document.querySelectorAll('button.btn-primary').forEach(btn => {
      btn.addEventListener('click', () => {
        const drink = btn.closest('.card').querySelector('.card-title').textContent.trim();
        const cart = JSON.parse(localStorage.getItem('cart') || '{}');
        cart[drink] = (cart[drink] || 0) + 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        btn.textContent = 'Added ✔';
        setTimeout(() => (btn.textContent = 'Order'), 1200);
      });
    });
  
    const cartTable = document.getElementById('cart-table');
    if (cartTable) {
      const cart = JSON.parse(localStorage.getItem('cart') || '{}');
      const tbody = cartTable.querySelector('tbody');
      let totalQty = 0;
      let totalPrice = 0;
  
      Object.entries(cart).forEach(([drink, qty]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${drink}</td>
          <td class="text-center">${qty}</td>
          <td class="text-end">$${(priceMap[drink] * qty).toFixed(2)}</td>`;
        tbody.appendChild(tr);
        totalQty += qty;
        totalPrice += priceMap[drink] * qty;
      });
  
      if (totalQty) {
        cartTable.classList.remove('d-none');
        document.getElementById('cart-total-qty').textContent = totalQty;
        document.getElementById('cart-total-price').textContent = `$${totalPrice.toFixed(2)}`;
        document.getElementById('place-order').classList.remove('d-none');
      } else {
        document.getElementById('cart-empty').classList.remove('d-none');
      }
  
      const placeBtn = document.getElementById('place-order');
      placeBtn?.addEventListener('click', () => {
        localStorage.removeItem('cart');
        location.reload();
        alert('Thank you! Your order has been placed.');
      });
    }
  })();
  