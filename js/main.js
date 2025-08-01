// Located in: /js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Add random rotation to all polaroid-style buttons ---
    document.querySelectorAll('.btn-polaroid').forEach(button => {
        const rotation = (Math.random() * 6) - 3; // A random tilt between -3 and +3 degrees
        button.style.setProperty('--btn-rotate', `${rotation}deg`);
    });

    // --- Contact Form Logic ---
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

    // --- Portfolio Unlock Form Logic ---
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
});
