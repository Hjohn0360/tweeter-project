const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginContent = document.getElementById('login-content');
const registerContent = document.getElementById('register-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const API_URL = 'https://tweeter-project-6tb9.onrender.com';

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginContent.classList.remove('hidden');
    registerContent.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerContent.classList.remove('hidden');
    loginContent.classList.add('hidden');
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const registerToTweeter = document.getElementById('register-to-tweeter').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                registerToTweeter
            })
        });
        
        const data = await response.json();
        console.log('Registration response:', data); 
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            loginTab.click();
        } else {
            alert(`Registration failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        console.log('Login response:', data); 
        
        if (response.ok && data.success) {
            localStorage.setItem('user', JSON.stringify({
                id: data.user._id || data.user.id, 
                username: data.user.username
            }));
            
            console.log('Saved user to localStorage:', JSON.parse(localStorage.getItem('user')));
            window.location.href = 'dashboard.html';
        } else {
            alert(`Login failed: ${data.message || 'Invalid credentials'}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        window.location.href = 'dashboard.html';
    }
}

checkAuth();