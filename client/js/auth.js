// LOGIN FORM HANDLER
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const email =
            document.getElementById('email').value;

        const password =
            document.getElementById('password').value;

        try {

            const response = await fetch(

                'http://localhost:5000/api/auth/login',

                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            // ERROR HANDLING
            if (!response.ok) {

                alert(data.message);

                return;
            }

            // SAVE TOKEN
            localStorage.setItem(
                'token',
                data.token
            );

            // SAVE USER
            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );

            alert('Login Successful');


            // ADMIN REDIRECT
            if (data.user.role === 'admin') {

                window.location.href =
                    'admin.html';

            } else {

                // USER REDIRECT
                window.location.href =
                    'index.html';
            }

        } catch (error) {

            console.log(error);

            alert('Something went wrong');
        }
    });
}

// REGISTER FORM HANDLER
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            console.log(data);

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert('Registration Successful! Please login.');
            window.location.href = 'login.html';

        } catch (error) {
            console.log(error);
            alert('Something went wrong');
        }
    });
}