/**
 * Dashboard JavaScript - For ShopLane E-commerce Website
 * Controls tab switching and interactive elements on the user dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll('.dashboard-nav li');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function() {
            // Remove active class from all tabs
            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Make "View All Orders" link work for tab switching
    const viewAllOrdersLink = document.querySelector('.view-all[data-tab="orders"]');
    if (viewAllOrdersLink) {
        viewAllOrdersLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate orders tab
            document.querySelector('.dashboard-nav li[data-tab="orders"]').classList.add('active');
            document.getElementById('orders').classList.add('active');
        });
    }
    
    // Order details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Here you would typically show a modal with order details
            // For this example, we'll just show an alert
            const orderId = this.closest('tr').querySelector('td').textContent;
            alert(`Order details for ${orderId} would show in a modal.`);
        });
    });
    
    // Wishlist item interactions
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.closest('.wishlist-item').querySelector('h3').textContent;
            alert(`${productName} added to cart!`);
        });
    });
    
    const removeItemButtons = document.querySelectorAll('.remove-item');
    removeItemButtons.forEach(button => {
        button.addEventListener('click', function() {
            const wishlistItem = this.closest('.wishlist-item');
            const productName = wishlistItem.querySelector('h3').textContent;
            
            if (confirm(`Remove ${productName} from wishlist?`)) {
                // Animation for removal
                wishlistItem.style.opacity = '0';
                setTimeout(() => {
                    wishlistItem.style.display = 'none';
                }, 300);
            }
        });
    });
    
    // Address management
    const addAddressBtn = document.querySelector('.add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            alert('A form to add a new address would appear here.');
        });
    }
    
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const addressType = this.closest('.address-card').querySelector('.address-type').textContent.trim().split(' ')[0];
            alert(`Edit form for ${addressType} address would appear here.`);
        });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const addressCard = this.closest('.address-card');
            const addressType = addressCard.querySelector('.address-type').textContent.trim().split(' ')[0];
            
            if (confirm(`Are you sure you want to delete this ${addressType} address?`)) {
                // Animation for removal
                addressCard.style.opacity = '0';
                setTimeout(() => {
                    addressCard.style.display = 'none';
                }, 300);
            }
        });
    });
    
    const defaultButtons = document.querySelectorAll('.default-btn');
    defaultButtons.forEach(button => {
        button.addEventListener('click', function() {
            const addressCards = document.querySelectorAll('.address-card');
            
            // Remove default badge from all addresses
            addressCards.forEach(card => {
                const addressType = card.querySelector('.address-type');
                const badge = addressType.querySelector('.default-badge');
                if (badge) {
                    addressType.removeChild(badge);
                }
            });
            
            // Add default badge to selected address
            const currentAddressType = this.closest('.address-card').querySelector('.address-type');
            const defaultBadge = document.createElement('span');
            defaultBadge.className = 'default-badge';
            defaultBadge.textContent = 'Default';
            currentAddressType.appendChild(defaultBadge);
            
            alert('Address set as default');
        });
    });
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Changes saved successfully!');
        });
    });
    
    // Danger zone - Delete account
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                if (prompt('Please type "DELETE" to confirm account deletion:') === 'DELETE') {
                    alert('Account deletion process initiated. You will receive a confirmation email.');
                }
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                // Redirect to homepage or login page
                window.location.href = 'index.html';
            }
        });
    }
    
    // Update account badges
    function updateBadges() {
        // In a real application, this would fetch data from the server
        // For this example, we'll just use the values from the overview cards
        const cartItems = document.querySelector('.card:nth-child(3) .card-value').textContent;
        const cartBadge = document.createElement('span');
        cartBadge.id = 'badge';
        cartBadge.textContent = cartItems;
        
        // Remove existing badge if any
        const existingBadge = document.getElementById('badge');
        if (existingBadge) {
            existingBadge.parentNode.removeChild(existingBadge);
        }
        
        // Add new badge
        const userSection = document.getElementById('user');
        if (userSection) {
            userSection.appendChild(cartBadge);
        }
    }
    
    // Call updateBadges after a short delay to ensure the DOM is fully loaded
    setTimeout(updateBadges, 500);
});