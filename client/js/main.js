function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function requireLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    if (user.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function setupNavMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navDropdown = document.getElementById('navDropdown');

    if (!menuToggle || !navDropdown) {
        return;
    }

    menuToggle.addEventListener('click', () => {
        navDropdown.classList.toggle('open');
    });

    window.addEventListener('click', (event) => {
        if (!navDropdown.contains(event.target) && !menuToggle.contains(event.target)) {
            navDropdown.classList.remove('open');
        }
    });
}

window.addEventListener('DOMContentLoaded', setupNavMenu);

