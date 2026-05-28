// Mobile Navigation Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger) {
    burger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.right = '5%';
        navLinks.style.background = 'rgba(7,13,24,0.97)';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderRadius = '12px';
        navLinks.style.border = '1px solid rgba(255,255,255,0.1)';
        navLinks.style.backdropFilter = 'blur(20px)';
        navLinks.style.gap = '1rem';
        navLinks.style.minWidth = '200px';
        navLinks.style.zIndex = '999';
    });
}
