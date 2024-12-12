document.addEventListener('DOMContentLoaded', () => {
    const cart = document.querySelector('.js-cart');
    const lightbox = document.querySelector('.js-lightbox');
    const body = document.body;

    // Function to toggle the cart and lightbox
    function toggleCart(e) {
        e.preventDefault();

        if (body.classList.contains('open')) {
            // Hide cart and lightbox
            body.classList.remove('open');
            cart.classList.add('hidden');
            lightbox.classList.add('hidden');
        } else {
            // Show cart and lightbox
            body.classList.add('open');
            cart.classList.remove('hidden');
            lightbox.classList.remove('hidden');
        }
    }

    // Attach event listener to buttons for toggling cart
    document.querySelectorAll('.js-toggle-cart').forEach(button => {
        button.addEventListener('click', toggleCart);
    });

    // Close cart and lightbox when clicking on the lightbox
    lightbox.addEventListener('click', () => {
        body.classList.remove('open');
        cart.classList.add('hidden');
        lightbox.classList.add('hidden');
    });
});


let cartData; // Global variable to store the data

// Fetch the JSON file
fetch('../assets/cart.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data from the response
    })
    .then(data => {
        console.log(data); // Log the fetched data for debugging
        cartData = data; // Store the fetched data globally
        renderCartItems(data.product_list); // Pass the product list to the render function
        renderProducts(data.product_list); // Also render the products for the product cards
        updateCartFooter(data); // Update the cart footer with the fetched data
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

// Function to format price in Rs
const formatPrice = (price) => `Rs ${(price / 100).toFixed(2)} /-`;

// Function to render cart items
const renderCartItems = (products) => {
    const container = document.getElementById("cart-items-container");
    container.innerHTML = ""; // Clear existing content

    products.forEach((product) => {
        const item = document.createElement("div");
        item.classList.add("cart-item");
        
        item.innerHTML = `
            <div class="cart-image">
                <img src="${product.images[0]}" alt="${product.title}">
            </div>
            <div class="cart-box">
                <div class="cart-details">
                    <p class="cart-title">${product.title}</p>
                    <p class="cart-price">${formatPrice(product.price)}</p>
                </div>
                <div class="cart-controls">
                    <span class="delete-btn"><img src="./assets/img/delete.png" alt="Delete" class="delete-img"></span>
                    <div class="quantity-control">
                        <button class="decrement-btn">-</button>
                        <span class="quantity">${product.quantity || 1}</span> <!-- Default quantity if not provided -->
                        <button class="increment-btn">+</button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(item);
    });

    // Add event listeners to increment and decrement buttons
    container.querySelectorAll('.increment-btn').forEach(button => {
        button.addEventListener('click', incrementQuantity);
    });

    container.querySelectorAll('.decrement-btn').forEach(button => {
        button.addEventListener('click', decrementQuantity);
    });
};

// Function to increment quantity
function incrementQuantity(event) {
    const itemElement = event.target.closest('.cart-item');
    const quantityElement = itemElement.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent, 10);
    quantity += 1;
    quantityElement.textContent = quantity;
    updateProductQuantity(itemElement, quantity);
}

// Function to decrement quantity
function decrementQuantity(event) {
    const itemElement = event.target.closest('.cart-item');
    const quantityElement = itemElement.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent, 10);
    if (quantity > 1) {
        quantity -= 1;
        quantityElement.textContent = quantity;
        updateProductQuantity(itemElement, quantity);
    }
}

// Function to update product quantity in the data and refresh the cart footer
function updateProductQuantity(itemElement, quantity) {
    const title = itemElement.querySelector('.cart-title').textContent;
    const product = cartData.product_list.find(product => product.title === title);
    if (product) {
        product.quantity = quantity;
        updateCartFooter(cartData); // Update footer with new quantity
    }
}

// Function to render product cards
const renderProducts = (products) => {
    const container = document.querySelector(".card-container");
    container.innerHTML = ""; // Clear existing content

    products.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        
        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}">
            <div class="product-details">
                <p class="product-title">${product.title}</p>
                <p class="price">${formatPrice(product.price)} <span class="old-price">${formatPrice(product.compare_at_price)}</span></p>
                <div class="size-options">
                    <button class="active">S</button>
                    <button>M</button>
                    <button>L</button>
                    <button>XS</button>
                    <button>XL</button>
                </div>
            </div>
            <button class="cart-button">
                <img src="./assets/img/cart.png" alt="cart" class="cart-img">
            </button>
        `;

        container.appendChild(card);
    });
};

// Function to update the cart footer
function updateCartFooter(data) {
    if (!data || !data.product_list) return;

    let totalDiscount = 0;
    let totalAmount = 0;

    data.product_list.forEach(product => {
        const price = parseFloat(product.price);
        const quantity = parseInt(product.quantity || 1); // Default quantity if not provided

        if (!isNaN(price) && !isNaN(quantity)) {
            if (product.compare_at_price !== null) {
                totalDiscount += (product.compare_at_price - price) * quantity;
            }
            totalAmount += price * quantity;
        }
    });

    document.getElementById('discount-value').textContent = `Rs ${totalDiscount.toFixed(2)} /-`;
    document.getElementById('total-value').textContent = `Rs ${totalAmount.toFixed(2)} /-`;
}
