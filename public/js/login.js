document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    const form = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    const errorMsg = document.getElementById('loginError');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMsg.innerText = '';
        const originalBtnText = btnLogin.innerText;
        btnLogin.innerText = 'A autenticar...';
        btnLogin.disabled = true;

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha na autenticação');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            
            window.location.href = '/';

        } catch (error) {
            errorMsg.innerText = error.message;
            btnLogin.innerText = originalBtnText;
            btnLogin.disabled = false;
        }
    });
});
