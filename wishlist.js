// Function to dynamically create wishlist item cards
function dynamicWishlistSection(ob) {
  let boxDiv = document.createElement("div");
  boxDiv.id = "box";
  boxDiv.setAttribute("data-id", ob.id);

  let boxLink = document.createElement("a");
  boxLink.href = "/contentDetails.html?" + ob.id;

  let imgTag = document.createElement("img");
  imgTag.src = ob.preview;

  let detailsDiv = document.createElement("div");
  detailsDiv.id = "details";

  let h3 = document.createElement("h3");
  let h3Text = document.createTextNode(ob.name);
  h3.appendChild(h3Text);

  let h4 = document.createElement("h4");
  let h4Text = document.createTextNode(ob.brand);
  h4.appendChild(h4Text);

  let h2 = document.createElement("h2");
  let h2Text = document.createTextNode("rs " + ob.price);
  h2.appendChild(h2Text);

  // Create remove from wishlist button
  let removeBtn = document.createElement("div");
  removeBtn.className = "remove-wishlist";
  removeBtn.innerHTML = '<i class="fas fa-heart heart-icon"></i>';
  removeBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(ob.id);
  };

  // Create add to cart button
  let addToCartBtn = document.createElement("button");
  addToCartBtn.className = "add-to-cart";
  addToCartBtn.innerHTML = "Add to Cart";
  addToCartBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(ob.id);
  };

  boxDiv.appendChild(boxLink);
  boxLink.appendChild(imgTag);
  boxDiv.appendChild(removeBtn);
  boxLink.appendChild(detailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(h4);
  detailsDiv.appendChild(h2);
  detailsDiv.appendChild(addToCartBtn);

  return boxDiv;
}

// Function to remove item from wishlist
function removeFromWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter(itemId => itemId !== id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  
  // Remove item from the DOM
  let itemToRemove = document.querySelector(`[data-id="${id}"]`);
  if (itemToRemove) {
    itemToRemove.remove();
  }
  
  // Update wishlist counter in header
  updateWishlistCounter();
  
  // Check if wishlist is empty after removal
  checkEmptyWishlist();
}

// Function to clear entire wishlist
function clearWishlist() {
  // Confirm before clearing
  if (confirm("Are you sure you want to clear your entire wishlist?")) {
    // Clear wishlist in localStorage
    localStorage.setItem("wishlist", JSON.stringify([]));
    
    // Clear wishlist in DOM
    let containerWishlist = document.getElementById("containerWishlist");
    containerWishlist.innerHTML = "";
    
    // Update wishlist counter in header
    updateWishlistCounter();
    
    // Show empty wishlist message
    checkEmptyWishlist();
  }
}

// Function to add item to cart
function addToCart(id) {
  let order = id + " ";
  let counter = 1;
  
  if (document.cookie.indexOf(",counter=") >= 0) {
    order = id + " " + document.cookie.split(',')[0].split('=')[1];
    counter = Number(document.cookie.split(',')[1].split('=')[1]) + 1;
  }
  
  document.cookie = "orderId=" + order + ",counter=" + counter;
  
  // Update cart counter in header
  let badgeElement = document.getElementById("badge");
  if (badgeElement) {
    badgeElement.innerHTML = counter;
  }
  
  alert("Item added to cart successfully!");
}

// Function to update wishlist counter in header
function updateWishlistCounter() {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let wishlistCounterElement = document.getElementById("wishlist-counter");
  if (wishlistCounterElement) {
    wishlistCounterElement.innerHTML = wishlist.length;
  }
}

// Function to check if wishlist is empty
function checkEmptyWishlist() {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let containerWishlist = document.getElementById("containerWishlist");
  let emptyWishlist = document.getElementById("emptyWishlist");
  let clearWishlistBtn = document.getElementById("clearWishlistBtn");
  
  if (wishlist.length === 0) {
    containerWishlist.style.display = "none";
    emptyWishlist.style.display = "block";
    clearWishlistBtn.style.display = "none";
  } else {
    containerWishlist.style.display = "grid";
    emptyWishlist.style.display = "none";
    clearWishlistBtn.style.display = "block";
  }
}

// Main function to load wishlist items
function loadWishlistItems() {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let containerWishlist = document.getElementById("containerWishlist");
  
  // Clear container first
  containerWishlist.innerHTML = "";
  
  // Check if wishlist is empty
  if (wishlist.length === 0) {
    checkEmptyWishlist();
    return;
  }
  
  // Fetch product data for each wishlist item
  wishlist.forEach(productId => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status == 200) {
          let product = JSON.parse(this.responseText);
          containerWishlist.appendChild(dynamicWishlistSection(product));
        } else {
          console.log("Failed to fetch product with ID: " + productId);
        }
      }
    };
    
    httpRequest.open(
      "GET",
      "https://5d76bf96515d1a0014085cf9.mockapi.io/product/" + productId,
      true
    );
    httpRequest.send();
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
  // Add event listener for clear wishlist button
  let clearWishlistBtn = document.getElementById("clearWishlistBtn");
  if (clearWishlistBtn) {
    clearWishlistBtn.addEventListener("click", clearWishlist);
  }
  
  loadWishlistItems();
  updateWishlistCounter();
  checkEmptyWishlist();
});