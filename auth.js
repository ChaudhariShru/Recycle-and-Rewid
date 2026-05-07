// ==========================================
// AUTH FUNCTIONS
// ==========================================

function signupUser(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    showAuthMessage('Creating account...', 'info');

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            return user.updateProfile({
                displayName: name
            }).then(() => {
                return db.collection('users').doc(user.uid).set({
                    name,
                    email,
                    phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            showAuthMessage('Account created! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        })
        .catch((error) => showAuthMessage(error.message, 'danger'));
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showAuthMessage('Logging in...', 'info');

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showAuthMessage('Login successful!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        })
        .catch((error) => showAuthMessage(error.message, 'danger'));
}

function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

function showAuthMessage(message, type) {
    const div = document.getElementById('authMessage');
    if (div) {
        div.textContent = message;
        div.className = `alert alert-${type} mt-3`;
        div.classList.remove('d-none');
    }
}

// Navbar auth toggle
auth.onAuthStateChanged((user) => {
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');

    if (user) {
        loginLink && (loginLink.style.display = 'none');
        logoutLink && (logoutLink.style.display = 'block');
        dashboardLink && (dashboardLink.style.display = 'block');
    } else {
        loginLink && (loginLink.style.display = 'block');
        logoutLink && (logoutLink.style.display = 'none');
        dashboardLink && (dashboardLink.style.display = 'none');
    }
});