/* ============================================
   RECYCLE & REWIND - Main JavaScript File
   ============================================ */

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCw8km1P5zP66hkgkguMM3cLBY6RN8mOXs",
  authDomain: "recycleandrewind.firebaseapp.com",
  projectId: "recycleandrewind",
  storageBucket: "recycleandrewind.firebasestorage.app",
  messagingSenderId: "635406177827",
  appId: "1:635406177827:web:424f6291371b4e5336c396",
};
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
emailjs.init("Uaxpd7E1KjcIDWthJ");

// ==========================================
// SCRAP ITEMS DATA
// ==========================================
// This array stores all scrap items with their details
const scrapItems = {
    paper: [
        { id: 'newspaper', name: 'Newspaper', icon: '📰', price: 14, unit: 'kg' },
        { id: 'books', name: 'Books/Magazines', icon: '📚', price: 12, unit: 'kg' },
        { id: 'cardboard', name: 'Cardboard', icon: '📦', price: 8, unit: 'kg' }
    ],
    plastic: [
        { id: 'bottles', name: 'Plastic Bottles', icon: '🍶', price: 10, unit: 'kg' },
        { id: 'containers', name: 'Containers', icon: '🫙', price: 8, unit: 'kg' },
        { id: 'hardplastic', name: 'Hard Plastic', icon: '🪣', price: 15, unit: 'kg' }
    ],
    metal: [
        { id: 'iron', name: 'Iron', icon: '🔧', price: 27, unit: 'kg' },
        { id: 'aluminum', name: 'Aluminum', icon: '🥫', price: 105, unit: 'kg' },
        { id: 'steel', name: 'Steel', icon: '⚙️', price: 37, unit: 'kg' },
        { id: 'copper', name: 'Copper', icon: '🔌', price: 425, unit: 'kg' }
    ],
    ewaste: [
        { id: 'mobile', name: 'Mobile Phone', icon: '📱', price: 50, unit: 'piece' },
        { id: 'laptop', name: 'Laptop', icon: '💻', price: 200, unit: 'piece' },
        { id: 'battery', name: 'Battery', icon: '🔋', price: 20, unit: 'piece' },
        { id: 'charger', name: 'Charger/Cable', icon: '🔌', price: 10, unit: 'piece' }
    ],
    glass: [
        { id: 'glassbottle', name: 'Glass Bottles', icon: '🍾', price: 3, unit: 'kg' },
        { id: 'glassjars', name: 'Glass Jars', icon: '🫙', price: 2, unit: 'kg' }
    ],
    clothes: [
        { id: 'cotton', name: 'Cotton Clothes', icon: '👔', price: 15, unit: 'kg' },
        { id: 'mixed', name: 'Mixed Clothes', icon: '🧥', price: 10, unit: 'kg' }
    ]
};

// Cart to store selected items
let cart = [];

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Sign up a new user
 * @param {Event} event - Form submit event
 */
function signupUser(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    
    // Show loading state
    showAuthMessage('Creating account...', 'info');
    
    // Create user with Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User created successfully
            const user = userCredential.user;
            
            // Update user profile with name
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Store additional user data in Firestore
                return db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    phone: phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            showAuthMessage('Account created successfully! Redirecting...', 'success');
            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch((error) => {
            // Handle errors
            showAuthMessage(error.message, 'danger');
        });
}

/**
 * Log in an existing user
 * @param {Event} event - Form submit event
 */
function loginUser(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Show loading state
    showAuthMessage('Logging in...', 'info');
    
    // Sign in with Firebase Auth
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showAuthMessage('Login successful! Redirecting...', 'success');
            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch((error) => {
            // Handle errors
            showAuthMessage(error.message, 'danger');
        });
}

/**
 * Log out the current user
 */
function logoutUser() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

/**
 * Display authentication messages
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, danger, info)
 */
function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type} mt-3`;
        messageDiv.classList.remove('d-none');
    }
}

// ==========================================
// AUTHENTICATION STATE LISTENER
// ==========================================
// This runs on every page to check if user is logged in
auth.onAuthStateChanged((user) => {
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');
    
    if (user) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'block';
    } else {
        // User is logged out
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
    }
});

// ==========================================
// SCRAP ITEMS DISPLAY FUNCTIONS
// ==========================================

/**
 * Load and display all scrap items on pickup page
 */
function loadScrapItems() {
    // Load items for each category
    renderCategoryItems('paperItems', scrapItems.paper);
    renderCategoryItems('plasticItems', scrapItems.plastic);
    renderCategoryItems('metalItems', scrapItems.metal);
    renderCategoryItems('ewasteItems', scrapItems.ewaste);
    renderCategoryItems('glassItems', scrapItems.glass);
    renderCategoryItems('clothesItems', scrapItems.clothes);
}

/**
 * Render items for a specific category
 * @param {string} containerId - ID of container element
 * @param {Array} items - Array of items to render
 */
function renderCategoryItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    
    items.forEach(item => {
        html += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="scrap-item" id="item-${item.id}" data-id="${item.id}">
                    <div class="scrap-item-icon">${item.icon}</div>
                    <div class="scrap-item-name">${item.name}</div>
                    <div class="scrap-item-price">₹${item.price}/${item.unit}</div>
                    
                    <!-- Add Button (shown initially) -->
                    <div class="add-section" id="add-${item.id}">
                        <button class="add-btn mt-2" onclick="addToCart('${item.id}')">
                            <i class="bi bi-plus-lg me-1"></i>Add
                        </button>
                    </div>
                    
                    <!-- Quantity Controls (hidden initially) -->
                    <div class="quantity-controls" id="qty-${item.id}" style="display: none;">
                        <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="quantity-value" id="qty-value-${item.id}">1</span>
                        <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Find item details by ID
 * @param {string} itemId - Item ID to find
 * @returns {Object|null} Item object or null
 */
function findItemById(itemId) {
    // Search through all categories
    for (const category of Object.values(scrapItems)) {
        const item = category.find(i => i.id === itemId);
        if (item) return item;
    }
    return null;
}

// ==========================================
// CART FUNCTIONS
// ==========================================

/**
 * Add item to cart
 * @param {string} itemId - Item ID to add
 */
function addToCart(itemId) {
    const item = findItemById(itemId);
    if (!item) return;
    
    // Check if item already in cart
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        // Increase quantity if already in cart
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: item.id,
            name: item.name,
            icon: item.icon,
            price: item.price,
            unit: item.unit,
            quantity: 1
        });
    }
    
    // Update UI
    updateItemUI(itemId);
    updateCartUI();
}

/**
 * Update quantity of item in cart
 * @param {string} itemId - Item ID
 * @param {number} change - Change in quantity (+1 or -1)
 */
function updateQuantity(itemId, change) {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem) return;
    
    cartItem.quantity += change;
    
    // Remove item if quantity reaches 0
    if (cartItem.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    // Update UI
    document.getElementById(`qty-value-${itemId}`).textContent = cartItem.quantity;
    updateCartUI();
}

/**
 * Remove item from cart
 * @param {string} itemId - Item ID to remove
 */
function removeFromCart(itemId) {
    // Remove from cart array
    cart = cart.filter(i => i.id !== itemId);
    
    // Reset item UI
    const itemElement = document.getElementById(`item-${itemId}`);
    if (itemElement) {
        itemElement.classList.remove('selected');
    }
    
    const addSection = document.getElementById(`add-${itemId}`);
    const qtySection = document.getElementById(`qty-${itemId}`);
    
    if (addSection) addSection.style.display = 'block';
    if (qtySection) qtySection.style.display = 'none';
    
    updateCartUI();
}

/**
 * Update individual item UI after adding to cart
 * @param {string} itemId - Item ID
 */
function updateItemUI(itemId) {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem) return;
    
    // Mark item as selected
    const itemElement = document.getElementById(`item-${itemId}`);
    if (itemElement) {
        itemElement.classList.add('selected');
    }
    
    // Show quantity controls, hide add button
    const addSection = document.getElementById(`add-${itemId}`);
    const qtySection = document.getElementById(`qty-${itemId}`);
    const qtyValue = document.getElementById(`qty-value-${itemId}`);
    
    if (addSection) addSection.style.display = 'none';
    if (qtySection) qtySection.style.display = 'flex';
    if (qtyValue) qtyValue.textContent = cartItem.quantity;
}

/**
 * Update cart display and totals
 */
function updateCartUI() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalsDiv = document.getElementById('cartTotals');
    const bookingForm = document.getElementById('bookingForm');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        // Empty cart
        cartItemsDiv.innerHTML = `
            <p class="text-muted text-center py-4">
                <i class="bi bi-cart-x display-6 d-block mb-2"></i>
                No items added yet
            </p>
        `;
        if (cartTotalsDiv) cartTotalsDiv.classList.add('d-none');
        if (bookingForm) bookingForm.classList.add('d-none');
        if (loginPrompt) loginPrompt.classList.add('d-none');
        return;
    }
    
    // Build cart items HTML
    let cartHTML = '';
    let totalWeight = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalWeight += item.quantity;
        totalPrice += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-icon">${item.icon}</span>
                    <div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-weight">${item.quantity} ${item.unit}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="cart-item-price">₹${itemTotal}</span>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = cartHTML;
    
   if (cartTotalsDiv) {
    cartTotalsDiv.classList.remove('d-none');

    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) {
        totalPriceEl.textContent = `₹${totalPrice}`;
    }
}
    
    // Show booking form or login prompt based on auth state
    auth.onAuthStateChanged((user) => {
        if (user && cart.length > 0) {
            if (bookingForm) bookingForm.classList.remove('d-none');
            if (loginPrompt) loginPrompt.classList.add('d-none');
        } else if (!user && cart.length > 0) {
            if (bookingForm) bookingForm.classList.add('d-none');
            if (loginPrompt) loginPrompt.classList.remove('d-none');
        }
    });
}

// ==========================================
// PICKUP SUBMISSION
// ==========================================

/**
 * Submit pickup request to Firestore
 */
function submitPickup() {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to book a pickup');
        return;
    }
    
    // Validate cart
    if (cart.length === 0) {
        alert('Please add items to your cart');
        return;
    }
    
    // Get form values
    const address = document.getElementById('pickupAddress').value;
    const date = document.getElementById('pickupDate').value;
    const timeSlot = document.getElementById('pickupTime').value;
    
    // Validate form
    if (!address || !date || !timeSlot) {
        alert('Please fill in all pickup details');
        return;
    }
    
    // Calculate totals
    let totalWeight = 0;
    let totalPrice = 0;
    const items = cart.map(item => {
        totalWeight += item.quantity;
        totalPrice += item.price * item.quantity;
        return {
           name: item.name,
            weight: item.quantity,
            unit: item.unit,
            price: item.price * item.quantity
        };
    });
    
    // Create pickup document
    const pickupData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        items: items,
        totalWeight: totalWeight,
        totalPrice: totalPrice,
        address: address,
        date: date,
        timeSlot: timeSlot,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    db.collection('pickups').add(pickupData)
       .then((docRef) => {
        console.log("Pickup saved with ID:", docRef.id);

        const treesSaved = (totalWeight * 0.5).toFixed(1);

        // Check if modal exists before using it
        const modalElement = document.getElementById('successModal');

        if (modalElement) {
            const impactMessage = document.getElementById('impactMessage');
            if (impactMessage) {
                impactMessage.innerHTML = `
                    🌳 You saved approximately <strong>${treesSaved} trees</strong>!<br>
                    <small>Thank you for helping the environment!</small>
                `;
            }

            const successModal = new bootstrap.Modal(modalElement);
            successModal.show();
        } else {
            // fallback if modal not present
            alert(`Pickup booked successfully!\nYou saved approx ${treesSaved} trees 🌳`);
        }

        // Clear cart
        cart = [];
        updateCartUI();
        loadScrapItems();

        // Clear form
        document.getElementById('pickupAddress').value = '';
        document.getElementById('pickupDate').value = '';
        document.getElementById('pickupTime').value = '';
        })
        .catch((error) => {
        console.error("FULL ERROR:", error);
        alert("Error booking pickup: " + error.message);
});
}

// ==========================================
// DASHBOARD FUNCTIONS
// ==========================================

/**
 * Load dashboard data for logged-in user
 * @param {Object} user - Firebase user object
 */
function loadDashboard(user) {
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userEmail').textContent = user.email;

    db.collection('pickups')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {

            let totalPickups = 0;
            let totalWeight = 0;
            let totalEarnings = 0;

            let scheduledHTML = '';
            let historyHTML = '';

            if (querySnapshot.empty) {
                document.getElementById('scheduledPickups').innerHTML = `
                    <p class="text-center text-muted py-4">No scheduled pickups</p>
                `;
                document.getElementById('pickupHistory').innerHTML = `
                    <p class="text-center text-muted py-4">No completed pickups</p>
                `;
                return;
            }

            querySnapshot.forEach((doc) => {
                const pickup = doc.data();

                totalPickups++;
                totalWeight += pickup.totalWeight || 0;
                totalEarnings += pickup.totalPrice || 0;

                // Build items badges
                let itemsBadges = '';
                if (pickup.items) {
                    pickup.items.forEach(item => {
                        itemsBadges += `<span class="badge bg-light text-dark me-1">
                            ${item.name} (${item.weight})
                        </span>`;
                    });
                }

                const pickupCard = `
                <div class="pickup-card shadow-sm mx-3 mb-3">
                    <div class="pickup-card-header d-flex justify-content-between">
                        <div>
                            <i class="bi bi-calendar3"></i> ${pickup.date}
                            <span class="ms-3"><i class="bi bi-clock"></i> ${pickup.timeSlot}</span>
                        </div>
                        <span class="badge ${pickup.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                            ${pickup.status === 'completed' ? 'Completed' : 'Scheduled'}
                        </span>
                    </div>

                    <div class="pickup-card-body">
                        <div class="mb-2">${itemsBadges}</div>
                        <div><strong>Weight:</strong> ${pickup.totalWeight} kg</div>
                        <div><strong>Value:</strong> ₹${pickup.totalPrice}</div>
                        <div class="text-muted mt-2">
                            <i class="bi bi-geo-alt"></i> ${pickup.address}
                        </div>
                    </div>
                </div>
                `;
                if (pickup.status === "completed") {
                    historyHTML += pickupCard;
                } else {
                    // EVERYTHING ELSE = pending
                    scheduledHTML += pickupCard;
                }
            });

            // Render both sections
            document.getElementById('scheduledPickups').innerHTML = scheduledHTML;
            document.getElementById('pickupHistory').innerHTML = historyHTML;

            // Stats
            document.getElementById('totalPickups').textContent = totalPickups;
            document.getElementById('totalWeightStats').textContent = totalWeight;
            document.getElementById('totalEarnings').textContent = totalEarnings;

            // Impact
            document.getElementById('treesSaved').textContent = Math.round(totalWeight * 0.5);
            document.getElementById('waterSaved').textContent = Math.round(totalWeight * 7);
            document.getElementById('energySaved').textContent = Math.round(totalWeight * 4);
        })
        .catch((error) => {
            console.error(error);
        });
}

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

/**
 * Load all pickups for admin view
 */
function loadAdminData() {
    // Get all pickups from Firestore
    db.collection('pickups')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            let totalPickups = 0;
            let totalWeight = 0;
            let totalValue = 0;
            const uniqueUsers = new Set();
            let tableHTML = '';
            
            if (querySnapshot.empty) {
                document.getElementById('adminPickupsTable').innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-5 text-muted">
                            No pickup requests yet
                        </td>
                    </tr>
                `;
            } else {
                querySnapshot.forEach((doc) => {
                    const pickup = doc.data();
                    totalPickups++;
                    totalWeight += pickup.totalWeight || 0;
                    totalValue += pickup.totalPrice || 0;
                    uniqueUsers.add(pickup.userEmail);
                    
                    // Build items list
                    let itemsList = '';
                    if (pickup.items && pickup.items.length > 0) {
                        pickup.items.forEach(item => {
                            itemsList += `${item.name} (${item.weight}), `;
                        });
                        itemsList = itemsList.slice(0, -2); // Remove trailing comma
                    }
                    
                    // Status badge
                    const statusClass = pickup.status === 'completed' ? 'status-completed' : 'status-pending';
                    const statusText = pickup.status === 'completed' ? 'Completed' : 'Pending';
                    
                    tableHTML += `
                        <tr>
                            <td class="ps-4">${pickup.date || 'N/A'}</td>
                            <td>${pickup.userEmail || 'N/A'}</td>
                            <td><small>${itemsList || 'N/A'}</small></td>
                            <td>${pickup.totalWeight || 0} kg</td>
                            <td>₹${pickup.totalPrice || 0}</td>
                            <td><small>${pickup.address || 'N/A'}</small></td>
                            <td>${pickup.timeSlot || 'N/A'}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;
                });
                
                document.getElementById('adminPickupsTable').innerHTML = tableHTML;
            }
            
            // Update admin stats
            document.getElementById('adminTotalPickups').textContent = totalPickups;
            document.getElementById('adminTotalWeight').textContent = totalWeight;
            document.getElementById('adminTotalValue').textContent = totalValue;
            document.getElementById('adminTotalUsers').textContent = uniqueUsers.size;
        })
        .catch((error) => {
            console.error('Error loading admin data:', error);
            document.getElementById('adminPickupsTable').innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5 text-danger">
                        Error loading data. Please refresh.
                    </td>
                </tr>
            `;
        });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Console log for debugging
console.log('Recycle & Rewind script loaded successfully!');
document.addEventListener('DOMContentLoaded', function () {
    loadScrapItems();
    
    const dateInput = document.getElementById('pickupDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.submitPickup = submitPickup;
window.logoutUser = logoutUser;

auth.onAuthStateChanged((user) => {
    if (user && user.email === "admin@gmail.com") {
        document.getElementById("adminLink")?.classList.remove("d-none");
    }
});


function sendCompletionEmail(email, name, requestId, items, amount) {

    if (!email) {
        console.error("Email missing ❌");
        return;
    }

    const templateParams = {
        to_email: email,
        user_name: name || "User",
        request_id: requestId,
        total_items: items || 0,
        amount: amount || 0,
        feedback_link: window.location.origin + "/feedback.html"
    };

    console.log("Sending Email:", templateParams);

    emailjs.send("service_nuurete", "template_r0l6cs8", templateParams)
        .then(res => {
            console.log("Email sent ✔", res.status);
        })
        .catch(err => {
            console.error("Email failed ❌", err);
        });
}