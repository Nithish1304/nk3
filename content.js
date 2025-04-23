// console.clear();

let contentTitle;

console.log(document.cookie);
function dynamicClothingSection(ob) {
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

  // Add wishlist button
  let wishlistBtn = document.createElement("div");
  wishlistBtn.className = "wishlist-icon";
  
  // Check if item is already in wishlist
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let isInWishlist = wishlist.includes(ob.id);
  
  wishlistBtn.innerHTML = isInWishlist 
    ? '<i class="fas fa-heart" style="color: red;"></i>' 
    : '<i class="far fa-heart"></i>';
  
  wishlistBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(ob.id, this);
  };

  boxDiv.appendChild(boxLink);
  boxDiv.appendChild(wishlistBtn);
  boxLink.appendChild(imgTag);
  boxLink.appendChild(detailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(h4);
  detailsDiv.appendChild(h2);

  return boxDiv;
}

// Function to toggle wishlist
function toggleWishlist(id, element) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let isInWishlist = wishlist.includes(id);
  
  if (isInWishlist) {
    // Remove from wishlist
    wishlist = wishlist.filter(itemId => itemId !== id);
    element.innerHTML = '<i class="far fa-heart"></i>';
  } else {
    // Add to wishlist
    wishlist.push(id);
    element.innerHTML = '<i class="fas fa-heart" style="color: red;"></i>';
  }
  
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  
  // Update wishlist counter in header
  updateWishlistCounter();
}

// Function to update wishlist counter in header
function updateWishlistCounter() {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let wishlistCounterElement = document.getElementById("wishlist-counter");
  if (wishlistCounterElement) {
    wishlistCounterElement.innerHTML = wishlist.length;
  }
}

let mainContainer = document.getElementById("mainContainer");
let containerClothing = document.getElementById("containerClothing");
let containerAccessories = document.getElementById("containerAccessories");

// BACKEND CALLING
let httpRequest = new XMLHttpRequest();

httpRequest.onreadystatechange = function() {
  if (this.readyState === 4) {
    if (this.status == 200) {
      contentTitle = JSON.parse(this.responseText);
      if (document.cookie.indexOf(",counter=") >= 0) {
        var counter = document.cookie.split(",")[1].split("=")[1];
        document.getElementById("badge").innerHTML = counter;
      }
      
      // Initialize wishlist counter
      updateWishlistCounter();
      
      for (let i = 0; i < contentTitle.length; i++) {
        if (contentTitle[i].isAccessory) {
          console.log(contentTitle[i]);
          containerAccessories.appendChild(
            dynamicClothingSection(contentTitle[i])
          );
        } else {
          console.log(contentTitle[i]);
          containerClothing.appendChild(
            dynamicClothingSection(contentTitle[i])
          );
        }
      }
    } else {
      console.log("call failed!");
    }
  }
};
httpRequest.open(
  "GET",
  "https://5d76bf96515d1a0014085cf9.mockapi.io/product",
  true
);
httpRequest.send();