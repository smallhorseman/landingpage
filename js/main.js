// Located in: /js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- DYNAMIC LOGO LOADER ---
    const logoImage = document.getElementById('site-logo');
    if (logoImage) {
        fetch('/.netlify/functions/get-random-logo')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.logoUrl) {
                    logoImage.src = data.logoUrl;
                }
            })
            .catch(error => {
                console.error('Could not load random logo:', error);
                // Fallback to a default logo if the fetch fails
                logoImage.src = 'https://live.staticflickr.com/65535/54694189593_785050da51_b.png';
            });
    }

    // --- POLAROID BUTTON ROTATION ---
    document.querySelectorAll('.btn-polaroid').forEach(button => {
        const rotation = (Math.random() * 6) - 3;
        button.style.setProperty('--btn-rotate', `${rotation}deg`);
    });

    // --- PORTFOLIO UNLOCK FORM ---
    const portfolioUnlockForm = document.getElementById('portfolio-unlock-form');
    if(portfolioUnlockForm) {
        portfolioUnlockForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = portfolioUnlockForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Unlocking...';

            const formData = new FormData(portfolioUnlockForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch('/.netlify/functions/unlock-portfolio', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(data) 
                });
                if (response.ok) {
                    window.location.href = 'portfolio.html';
                } else {
                    const result = await response.json();
                    throw new Error(result.message || 'An error occurred.');
                }
            } catch (error) {
                alert('Error: ' + error.message);
                submitButton.disabled = false;
                submitButton.textContent = 'Unlock Now & Get Coupon';
            }
        });
    }

    // --- CONTACT FORM ---
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch('/.netlify/functions/submit-form', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(data) 
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
                alert(result.message);
                contactForm.reset();
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }
});
