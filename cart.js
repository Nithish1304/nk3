document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    loadCart();
    
    // Event listeners
    document.getElementById('continueShoppingBtn').addEventListener('click', continueShopping);
    document.getElementById('applyCoupon').addEventListener('click', applyCoupon);
    document.getElementById('checkoutBtn').addEventListener('click', proceedToCheckout);
});

// Load cart items and update UI
function loadCart() {
    // Create container for cart items
    let boxContainerDiv = document.createElement('div');
    boxContainerDiv.id = 'boxContainer';
    
    // Check if cart has items
    if (document.cookie.indexOf('orderId=') >= 0) {
        // Parse cookie to get cart data
        let cookieData = parseCookieData();
        let counter = cookieData.counter || 0;
        
        // Update cart badge and total items count
        updateCartCounter(counter);
        
        if (counter > 0) {
            // Fetch products and build cart UI
            fetchProducts(boxContainerDiv, cookieData.items);
        } else {
            showEmptyCart();
        }
    } else {
        // No cookie found, show empty cart
        showEmptyCart();
    }
}

// Parse cookie data to get cart information
function parseCookieData() {
    let cookies = document.cookie.split(';');
    let orderIdCookie = '';
    let counterCookie = '';
    
    // Find relevant cookies
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith('orderId=')) {
            orderIdCookie = cookie;
        } else if (cookie.startsWith('counter=')) {
            counterCookie = cookie;
        }
    }

    // If no 'orderId=' cookie found in split cookies, try the original format
    if (!orderIdCookie && document.cookie.indexOf('orderId=') >= 0) {
        let cookieParts = document.cookie.split(',');
        if (cookieParts.length >= 2) {
            orderIdCookie = cookieParts[0];
            counterCookie = cookieParts[1];
        }
    }
    
    // Extract items and counter
    let items = [];
    if (orderIdCookie) {
        let itemsStr = orderIdCookie.split('=')[1];
        if (itemsStr) {
            items = itemsStr.split(' ').filter(item => item !== '');
        }
    }
    
    let counter = 0;
    if (counterCookie) {
        counter = parseInt(counterCookie.split('=')[1]) || 0;
    } else if (document.cookie.indexOf(',counter=') >= 0) {
        counter = parseInt(document.cookie.split(',')[1].split('=')[1]) || 0;
    }
    
    return { items, counter };
}

// Update cart counter in UI
function updateCartCounter(counter) {
    // Update badge if it exists
    let badge = document.getElementById('badge');
    if (badge) {
        badge.innerHTML = counter;
    }
    
    // Update total items text
    let totalItem = document.getElementById('totalItem');
    if (totalItem) {
        totalItem.innerHTML = 'Total Items: ' + counter;
    }
}

// Show empty cart UI
function showEmptyCart() {
    document.getElementById('cartContainer').style.display = 'none';
    document.getElementById('orderSummary').style.display = 'none';
    document.getElementById('emptyCart').style.display = 'block';
}

// Fetch products from API and build cart UI
function fetchProducts(boxContainerDiv, cartItems) {
    let httpRequest = new XMLHttpRequest();
    let totalAmount = 0;
    
    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4 && this.status == 200) {
            try {
                let products = JSON.parse(this.responseText);
                let itemCounts = countCartItems(cartItems);
                
                // Create cart items
                Object.keys(itemCounts).forEach(productId => {
                    let product = products.find(p => p.id === productId);
                    if (product) {
                        let quantity = itemCounts[productId];
                        let itemSubtotal = product.price * quantity;
                        totalAmount += itemSubtotal;
                        
                        createCartItem(boxContainerDiv, product, quantity, itemSubtotal);
                    }
                });
                
                // Append items to cart
                let cartContainer = document.getElementById('cartContainer');
                cartContainer.innerHTML = '';
                cartContainer.appendChild(boxContainerDiv);
                
                // Make cart container visible
                cartContainer.style.display = 'block';
                document.getElementById('orderSummary').style.display = 'block';
                document.getElementById('emptyCart').style.display = 'none';
                
                // Update summary
                updateOrderSummary(totalAmount);
            } catch (error) {
                console.error("Error parsing product data:", error);
                showEmptyCart();
            }
        }
    };
    
    httpRequest.open('GET', 'https://5d76bf96515d1a0014085cf9.mockapi.io/product', true);
    httpRequest.send();
}

// Count occurrences of each item in cart
function countCartItems(items) {
    let itemCounts = {};
    
    for (let i = 0; i < items.length; i++) {
        if (items[i] && items[i] !== "") {
            if (itemCounts[items[i]]) {
                itemCounts[items[i]]++;
            } else {
                itemCounts[items[i]] = 1;
            }
        }
    }
    
    return itemCounts;
}

// Create a cart item element
function createCartItem(container, product, quantity, subtotal) {
    let boxDiv = document.createElement('div');
    boxDiv.id = 'box';
    boxDiv.dataset.productId = product.id;
    
    // Product image
    let boxImg = document.createElement('img');
    boxImg.src = product.preview;
    boxImg.alt = product.name;
    boxDiv.appendChild(boxImg);
    
    // Item details
    let detailsDiv = document.createElement('div');
    detailsDiv.className = 'item-details';
    
    let nameHeading = document.createElement('h3');
    nameHeading.textContent = product.name;
    detailsDiv.appendChild(nameHeading);
    
    let brandHeading = document.createElement('h4');
    brandHeading.textContent = product.brand;
    detailsDiv.appendChild(brandHeading);
    
    let priceHeading = document.createElement('div');
    priceHeading.className = 'price';
    priceHeading.textContent = 'Rs ' + product.price;
    detailsDiv.appendChild(priceHeading);
    
    // Quantity controls
    let itemActions = document.createElement('div');
    itemActions.className = 'item-actions';
    
    let quantitySelector = document.createElement('div');
    quantitySelector.className = 'quantity-selector';
    
    let minusBtn = document.createElement('button');
    minusBtn.className = 'quantity-btn';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', function() {
        updateQuantity(product.id, -1);
    });
    
    let quantityInput = document.createElement('input');
    quantityInput.type = 'text';
    quantityInput.className = 'quantity-input';
    quantityInput.value = quantity;
    quantityInput.readOnly = true;
    
    let plusBtn = document.createElement('button');
    plusBtn.className = 'quantity-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', function() {
        updateQuantity(product.id, 1);
    });
    
    quantitySelector.appendChild(minusBtn);
    quantitySelector.appendChild(quantityInput);
    quantitySelector.appendChild(plusBtn);
    
    itemActions.appendChild(quantitySelector);
    detailsDiv.appendChild(itemActions);
    
    boxDiv.appendChild(detailsDiv);
    
    // Item controls (subtotal and remove)
    let controlsDiv = document.createElement('div');
    controlsDiv.className = 'item-controls';
    
    let removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function() {
        removeItem(product.id);
    });
    
    let subtotalDiv = document.createElement('div');
    subtotalDiv.className = 'item-subtotal';
    subtotalDiv.textContent = 'Rs ' + subtotal;
    
    controlsDiv.appendChild(subtotalDiv);
    controlsDiv.appendChild(removeBtn);
    
    boxDiv.appendChild(controlsDiv);
    
    container.appendChild(boxDiv);
}

// Update order summary
function updateOrderSummary(itemsTotal) {
    const shippingCost = itemsTotal > 0 ? 50 : 0;
    const totalCost = itemsTotal + shippingCost;
    
    document.getElementById('items-price').textContent = 'Rs ' + itemsTotal;
    document.getElementById('shipping-price').textContent = 'Rs ' + shippingCost;
    document.getElementById('total-price').textContent = 'Rs ' + totalCost;
    
    // Reset coupon if present
    document.getElementById('discount-row').style.display = 'none';
    document.getElementById('applyCoupon').textContent = 'Apply';
    document.getElementById('applyCoupon').disabled = false;
    document.getElementById('couponCode').disabled = false;
    document.getElementById('couponCode').value = '';
}

// Update item quantity
function updateQuantity(productId, change) {
    // Get cookie data
    let cookieData = parseCookieData();
    let items = cookieData.items;
    let counter = cookieData.counter;
    
    if (change > 0) {
        // Add item
        items.push(productId);
        counter++;
    } else {
        // Remove one item
        let index = items.indexOf(productId);
        if (index !== -1) {
            items.splice(index, 1);
            counter--;
        }
    }
    
    // Update cookie
    document.cookie = "orderId=" + items.join(' ') + ",counter=" + counter;
    
    // Reload cart
    loadCart();
}

// Remove item completely
function removeItem(productId) {
    // Get cookie data
    let cookieData = parseCookieData();
    let items = cookieData.items;
    
    // Remove all instances of product
    items = items.filter(item => item !== productId);
    
    // Update counter
    let counter = items.length;
    
    // Update cookie
    document.cookie = "orderId=" + items.join(' ') + ",counter=" + counter;
    
    // Reload cart
    loadCart();
}

// Apply coupon
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
    
    // Simple coupon logic
    if (couponCode === 'SALE20') {
        // Show discount row
        document.getElementById('discount-row').style.display = 'flex';
        
        // Calculate discount
        const itemsTotal = parseInt(document.getElementById('items-price').textContent.replace('Rs ', ''));
        const discount = Math.floor(itemsTotal * 0.2);
        document.getElementById('discount-amount').textContent = '- Rs ' + discount;
        
        // Update total
        const shippingCost = parseInt(document.getElementById('shipping-price').textContent.replace('Rs ', ''));
        const newTotal = itemsTotal + shippingCost - discount;
        document.getElementById('total-price').textContent = 'Rs ' + newTotal;
        
        // Change button state
        document.getElementById('applyCoupon').textContent = 'Applied';
        document.getElementById('applyCoupon').disabled = true;
        document.getElementById('couponCode').disabled = true;
    } else if (couponCode) {
        alert('Invalid coupon code. Please try again.');
    }
}

// Continue shopping
function continueShopping() {
    window.location.href = 'index.html';
}

// Proceed to checkout
function proceedToCheckout() {
    // Clear any errors
    const errorMsgElement = document.getElementById('checkout-error');
    if (errorMsgElement) {
        errorMsgElement.remove();
    }
    
    // Check if cart has items
    const totalPrice = document.getElementById('total-price').textContent;
    if (totalPrice === 'Rs 0') {
        // Create error message
        const errorMsg = document.createElement('div');
        errorMsg.id = 'checkout-error';
        errorMsg.style.color = '#e53935';
        errorMsg.style.fontSize = '14px';
        errorMsg.style.marginTop = '10px';
        errorMsg.style.textAlign = 'center';
        errorMsg.textContent = 'Your cart is empty. Add items before checkout.';
        
        // Append error message
        document.querySelector('.checkout-button').appendChild(errorMsg);
    } else {
        window.location.href = 'orderPlaced.html';
    }
}

// Initialize cart when page loads
loadCart();