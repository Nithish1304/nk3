// Global variables
let clothingData = [];
let filteredClothingData = [];
let uniqueBrands = [];

// DOM Elements
const clothingItemsContainer = document.getElementById('clothingItems');
const brandFiltersContainer = document.getElementById('brandFilters');
const sortSelect = document.getElementById('sortSelect');
const applyFiltersButton = document.getElementById('applyFilters');
const clearFiltersButton = document.getElementById('clearFilters');

// Set badge count from cookies if exists
if (document.cookie.indexOf(',counter=') >= 0) {
    let counter = document.cookie.split(',')[1].split('=')[1];
    document.getElementById("badge").innerHTML = counter;
}

// Function to create clothing item HTML
function createClothingBox(item) {
    let boxDiv = document.createElement("div");
    boxDiv.className = "clothingBox";

    let boxLink = document.createElement("a");
    boxLink.href = "/contentDetails.html?" + item.id;

    let imgTag = document.createElement("img");
    imgTag.src = item.preview;
    imgTag.alt = item.name;

    let detailsDiv = document.createElement("div");
    detailsDiv.className = "clothingDetails";

    let h3 = document.createElement("h3");
    let h3Text = document.createTextNode(item.name);
    h3.appendChild(h3Text);

    let h4 = document.createElement("h4");
    let h4Text = document.createTextNode(item.brand);
    h4.appendChild(h4Text);

    let h2 = document.createElement("h2");
    let h2Text = document.createTextNode("Rs " + item.price);
    h2.appendChild(h2Text);

    boxDiv.appendChild(boxLink);
    boxLink.appendChild(imgTag);
    boxLink.appendChild(detailsDiv);
    detailsDiv.appendChild(h3);
    detailsDiv.appendChild(h4);
    detailsDiv.appendChild(h2);

    return boxDiv;
}

// Function to display clothing items
function displayClothingItems(items) {
    clothingItemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        let noResultsDiv = document.createElement("div");
        noResultsDiv.className = "noResults";
        noResultsDiv.textContent = "No clothing items match your filters. Please try different criteria.";
        clothingItemsContainer.appendChild(noResultsDiv);
        return;
    }
    
    items.forEach(item => {
        clothingItemsContainer.appendChild(createClothingBox(item));
    });
}

// Function to populate brand filters
function populateBrandFilters() {
    brandFiltersContainer.innerHTML = '';
    
    uniqueBrands.forEach(brand => {
        let label = document.createElement("label");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "brand";
        checkbox.value = brand;
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + brand));
        
        brandFiltersContainer.appendChild(label);
    });
}

// Function to apply filters
function applyFilters() {
    // Get selected brands
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Get selected price ranges
    const selectedPriceRanges = Array.from(document.querySelectorAll('input[name="price"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Filter clothing data
    filteredClothingData = clothingData.filter(item => {
        // Brand filter
        const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
        
        // Price filter
        let priceMatch = selectedPriceRanges.length === 0;
        
        if (!priceMatch) {
            selectedPriceRanges.forEach(range => {
                if (range === '0-500' && item.price <= 500) {
                    priceMatch = true;
                } else if (range === '500-1000' && item.price > 500 && item.price <= 1000) {
                    priceMatch = true;
                } else if (range === '1000-1500' && item.price > 1000 && item.price <= 1500) {
                    priceMatch = true;
                } else if (range === '1500+' && item.price > 1500) {
                    priceMatch = true;
                }
            });
        }
        
        return brandMatch && priceMatch;
    });
    
    // Apply sorting
    applySorting();
}

// Function to apply sorting
function applySorting() {
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'name-asc':
            filteredClothingData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredClothingData.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredClothingData.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredClothingData.sort((a, b) => b.price - a.price);
            break;
        default:
            // Default sorting (by id)
            filteredClothingData.sort((a, b) => a.id - b.id);
    }
    
    displayClothingItems(filteredClothingData);
}

// Function to clear all filters
function clearAllFilters() {
    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset sort
    sortSelect.value = 'default';
    
    // Reset filtered data
    filteredClothingData = [...clothingData];
    
    // Display all items
    displayClothingItems(filteredClothingData);
}

// Event listeners
sortSelect.addEventListener('change', applySorting);
applyFiltersButton.addEventListener('click', applyFilters);
clearFiltersButton.addEventListener('click', clearAllFilters);

// Fetch clothing data from API
fetch('https://5d76bf96515d1a0014085cf9.mockapi.io/product')
    .then(response => response.json())
    .then(data => {
        // Filter only clothing items (not accessories)
        clothingData = data.filter(item => !item.isAccessory);
        filteredClothingData = [...clothingData];
        
        // Extract unique brands
        uniqueBrands = [...new Set(clothingData.map(item => item.brand))];
        
        // Populate brand filters
        populateBrandFilters();
        
        // Display all clothing items
        displayClothingItems(clothingData);
    })
    .catch(error => {
        console.error('Error fetching clothing data:', error);
        clothingItemsContainer.innerHTML = '<div class="noResults">Failed to load clothing items. Please try again later.</div>';
    });