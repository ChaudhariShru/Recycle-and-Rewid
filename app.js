// ==========================================
// SCRAP DATA
// ==========================================
const scrapItems = {
    paper: [
        { id: 'newspaper', name: 'Newspaper', icon: '📰', price: 14, unit: 'kg' },
        { id: 'books', name: 'Books', icon: '📚', price: 12, unit: 'kg' }
    ],
    plastic: [
        { id: 'bottles', name: 'Bottles', icon: '🍶', price: 10, unit: 'kg' }
    ],
    metal: [
        { id: 'iron', name: 'Iron', icon: '🔧', price: 27, unit: 'kg' }
    ]
};

let cart = [];

// ==========================================
// LOAD ITEMS
// ==========================================
function loadScrapItems() {
    renderCategoryItems('paperItems', scrapItems.paper);
    renderCategoryItems('plasticItems', scrapItems.plastic);
    renderCategoryItems('metalItems', scrapItems.metal);
}

function renderCategoryItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map(item => `
        <div class="col-6 col-md-4">
            <div class="scrap-item" id="item-${item.id}">
                <div>${item.icon}</div>
                <div>${item.name}</div>
                <div>₹${item.price}/${item.unit}</div>

                <button onclick="addToCart('${item.id}')">Add</button>
                <div id="qty-${item.id}" style="display:none;">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span id="val-${item.id}">1</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function findItem(id) {
    return Object.values(scrapItems).flat().find(i => i.id === id);
}

// ==========================================
// CART
// ==========================================
function addToCart(id) {
    const item = findItem(id);

    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });

    document.getElementById(`qty-${id}`).style.display = 'block';
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
        document.getElementById(`qty-${id}`).style.display = 'none';
    }

    updateCartUI();
}

function updateCartUI() {
    const div = document.getElementById('cartItems');
    if (!div) return;

    if (cart.length === 0) {
        div.innerHTML = "No items";
        return;
    }

    div.innerHTML = cart.map(i => `
        <div>${i.name} - ${i.quantity} (${i.price * i.quantity})</div>
    `).join('');
}

// ==========================================
// PICKUP
// ==========================================
function submitPickup() {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    db.collection('pickups').add({
        userId: user.uid,
        items: cart,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Pickup booked!");
        cart = [];
        updateCartUI();
    });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('paperItems')) {
        loadScrapItems();
    }
});