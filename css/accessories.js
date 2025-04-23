console.clear();

// Function to create dynamic product cards
function createProductCard(product) {
    let boxDiv = document.createElement("div");
    boxDiv.id = "box";

    let boxLink = document.createElement("a");
    boxLink.href = "/contentDetails.html?" + product.id;

    let imgTag = document.createElement("img");
    imgTag.src = product.preview;

    let detailsDiv = document.createElement("div");
    detailsDiv.id = "details";

    let h3 = document.createElement("h3");
    let h3Text = document.createTextNode(product.name);
    h3.appendChild(h3Text);

    let h4 = document.createElement("h4");
    let h4Text = document.createTextNode(product.brand);
    h4.appendChild(h4Text);

    let h2 = document.createElement("h2");
    let h2Text = document.createTextNode("Rs " + product.price);
    h2.appendChild(h2Text);

    boxDiv.appendChild(boxLink);
    boxLink.appendChild(imgTag);
    boxLink.appendChild(detailsDiv);
    detailsDiv.appendChild(h3);
    detailsDiv.appendChild(h4);
    detailsDiv.appendChild(h2);

    return boxDiv;
}

// Update the badge counter in header
function updateCartCount() {
    if(document.cookie.indexOf(',counter=') >= 0) {
        let counter = document.cookie.split(',')[1].split('=')[1];
        document.getElementById("badge").innerHTML = counter;
    }
}

// Main function to fetch and display accessory products
function loadAccessories() {
    let containerAccessories = document.getElementById("containerAccessories");
    
    // Show loading state
    containerAccessories.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Loading accessories...</div>';
    
    // Make API call
    let httpRequest = new XMLHttpRequest();
    
    httpRequest.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status == 200) {
                let products = JSON.parse(this.responseText);
                
                // Update cart badge
                updateCartCount();
                
                // Clear loading state
                containerAccessories.innerHTML = '';
                
                // Filter and display only accessories
                let accessoriesCount = 0;
                for (let i = 0; i < products.length; i++) {
                    if (products[i].isAccessory) {
                        containerAccessories.appendChild(createProductCard(products[i]));
                        accessoriesCount++;
                    }
                }
                
                // If no accessories found
                if (accessoriesCount === 0) {
                    containerAccessories.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No accessories found.</div>';
                }
            } else {
                containerAccessories.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Failed to load accessories. Please try again later.</div>';
                console.log("API call failed with status: " + this.status);
            }
        }
    };
    
    httpRequest.open("GET", "https://5d76bf96515d1a0014085cf9.mockapi.io/product", true);
    httpRequest.send();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAccessories();
});