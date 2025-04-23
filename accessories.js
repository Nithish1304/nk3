// Global variables
let productsData = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentView = 'grid';
let currentSort = 'default';
let maxPrice = 10000;

// DOM Elements
const productContainer = document.getElementById('product-container');
const sortSelect = document.getElementById('sort-select');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const categoryFilters = document.querySelectorAll('#category-filters input');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.getElementById('page-numbers');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    setupEventListeners();
});

// Fetch products from API
function fetchProducts() {
    productContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading products...</p>
        </div>
    `;

    fetch('https://5d76bf96515d1a0014085cf9.mockapi.io/product')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Filter only accessories
            productsData = data.filter(product => product.isAccessory);
            
            // Find max price for the price range filter
            maxPrice = Math.max(...productsData.map(product => product.price));
            priceRange.max = maxPrice;
            priceRange.value = maxPrice;
            priceValue.textContent = `₹${maxPrice}`;
            
            // Initial filtering and rendering
            filterProducts();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Failed to load products</h3>
                    <p>Please try again later</p>
                </div>
            `;
        });
}

// Set up event listeners
function setupEventListeners() {
    // Sort select
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        filterProducts();
    });

    // View buttons
    gridViewBtn.addEventListener('click', function() {
        setView('grid');
    });
    
    listViewBtn.addEventListener('click', function() {
        setView('list');
    });

    // Price range
    priceRange.addEventListener('input', function() {
        priceValue.textContent = `₹${this.value}`;
    });
    
    priceRange.addEventListener('change', function() {
        filterProducts();
    });

    // Category filters
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            if (this.id === 'all' && this.checked) {
                // If "All" is checked, uncheck others
                categoryFilters.forEach(f => {
                    if (f.id !== 'all') f.checked = false;
                });
            } else if (this.checked) {
                // If any other is checked, uncheck "All"
                document.getElementById('all').checked = false;
            }
            
            // If none are checked, check "All"
            const anyChecked = Array.from(categoryFilters).some(f => f.checked);
            if (!anyChecked) {
                document.getElementById('all').checked = true;
            }
            
            filterProducts();
        });
    });

    // Pagination
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        if (currentPage < Math.ceil(filteredProducts.length / productsPerPage)) {
            currentPage++;
            renderProducts();
        }
    });

    // Update cart count
    updateCartCount();
}

// Filter products based on current filter settings
function filterProducts() {
    // Get selected categories
    const selectedCategories = Array.from(categoryFilters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);
    
    // If "All" is selected or no categories selected, show all products
    const showAllCategories = selectedCategories.includes('all') || selectedCategories.length === 0;
    
    // Get price range
    const maxPriceValue = parseInt(priceRange.value);
    
    // Filter products
    filteredProducts = productsData.filter(product => {
        // Filter by price
        const priceMatch = product.price <= maxPriceValue;
        
        // Filter by category
        let categoryMatch = true;
        if (!showAllCategories) {
            // This is a simplified example. In a real app, you'd have category data in products
            // For this example, we're using basic logic to assign categories
            const productCategory = getCategoryFromProduct(product);
            categoryMatch = selectedCategories.includes(productCategory);
        }
        
        return priceMatch && categoryMatch;
    });
    
    // Sort products
    sortProducts();
    
    // Reset to first page
    currentPage = 1;
    
    // Render products
    renderProducts();
}

// Helper function to determine category from product
function getCategoryFromProduct(product) {
    const name = product.name.toLowerCase();
    if (name.includes('watch')) return 'watches';
    if (name.includes('bag') || name.includes('backpack')) return 'bags';
    if (name.includes('belt')) return 'belts';
    return 'others';
}

// Sort products based on current sort option
function sortProducts() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Default sorting (featured)
            filteredProducts.sort((a, b) => a.id - b.id);
    }
}

// Render products based on current page
function renderProducts() {
    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update pagination UI
    updatePagination(totalPages);
    
    // Check if there are products to show
    if (filteredProducts.length === 0) {
        productContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    // Clear product container
    productContainer.innerHTML = '';
    
    // Add class for list view if active
    if (currentView === 'list') {
        productContainer.classList.add('list-view');
    } else {
        productContainer.classList.remove('list-view');
    }
    
    // Render each product
    currentProducts.forEach(product => {
        const productCard = createProductCard(product);
        productContainer.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const productLink = document.createElement('a');
    productLink.href = `/contentDetails.html?${product.id}`;
    
    const productImage = document.createElement('img');
    productImage.className = 'product-image';
    productImage.src = product.preview;
    productImage.alt = product.name;
    
    const productDetails = document.createElement('div');
    productDetails.className = 'product-details';
    
    const productName = document.createElement('h3');
    productName.className = 'product-name';
    productName.textContent = product.name;
    
    const productBrand = document.createElement('p');
    productBrand.className = 'product-brand';
    productBrand.textContent = product.brand;
    
    const productPrice = document.createElement('h4');
    productPrice.className = 'product-price';
    productPrice.textContent = `₹${product.price}`;
    
    const productActions = document.createElement('div');
    productActions.className = 'product-actions';
    
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn btn-primary';
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addToCart(product.id);
    });
    
    const wishlistBtn = document.createElement('button');
    wishlistBtn.className = 'btn btn-outline';
    wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        this.innerHTML = '<i class="fas fa-heart"></i>';
        this.style.color = '#f44336';
    });
    
    // Assemble the product card
    productDetails.appendChild(productName);
    productDetails.appendChild(productBrand);
    productDetails.appendChild(productPrice);
    productActions.appendChild(addToCartBtn);
    productActions.appendChild(wishlistBtn);
    productDetails.appendChild(productActions);
    
    productLink.appendChild(productImage);
    productLink.appendChild(productDetails);
    productCard.appendChild(productLink);
    
    return productCard;
}

// Update pagination UI
function updatePagination(totalPages) {
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    // For sites with many pages, show limited page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    if (startPage > 1) {
        const firstPage = document.createElement('span');
        firstPage.className = 'page-number';
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => {
            currentPage = 1;
            renderProducts();
        });
        pageNumbers.appendChild(firstPage);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = i === currentPage ? 'current-page' : 'page-number';
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            renderProducts();
        });
        pageNumbers.appendChild(pageNumber);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPage = document.createElement('span');
        lastPage.className = 'page-number';
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => {
            currentPage = totalPages;
            renderProducts();
        });
        pageNumbers.appendChild(lastPage);
    }
}

// Set view mode (grid or list)
function setView(view) {
    currentView = view;
    
    // Update active class on buttons
    if (view === 'grid') {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
    }
    
    // Re-render products
    renderProducts();
}

// Add product to cart
function addToCart(productId) {
    let order = productId + " ";
    let counter = 1;
    
    if (document.cookie.indexOf(',counter=') >= 0) {
        order = productId + " " + document.cookie.split(',')[0].split('=')[1];
        counter = Number(document.cookie.split(',')[1].split('=')[1]) + 1;
    }
    
    document.cookie = "orderId=" + order + ",counter=" + counter;
    updateCartCount();
    
    // Show confirmation
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Added to cart';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// Update cart count in header
function updateCartCount() {
    if (document.cookie.indexOf(',counter=') >= 0) {
        let counter = document.cookie.split(',')[1].split('=')[1];
        document.getElementById("badge").innerHTML = counter;
    }
}

// Add toast styling
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    .toast i {
        color: #4CAF50;
    }
`;
document.head.appendChild(style);