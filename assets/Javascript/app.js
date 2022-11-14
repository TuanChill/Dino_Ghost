const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const CART_LOCAL = "DINO_CART";

const productCard = $(".content");
const container = $(".container");
const closeBtnNav = $$(".close-btn");
const navBar = $(".nav-bar");
const menuBtn = $(".menu-btn");
const BtnBuy = $(".btn-buy");
const productInfo = $(".product-info .content");
const productPreview = $(".product-preview");
const cartLength = $(".cart-length");
const toastWrapper = $(".toast-message .wrapper");
const cartBox = $(".cart-box");
const cartContent = $(".cart-box .cart-content");
const cartIcon = $(".cart-icon");
const cartNull = $$(".cart-null");
const btnCheckout = $(".btn-checkout");
const cartFullContent = $(".cart-box-full .cart-content");
const cartFullBox = $(".cart-box-full");
const btnContinueShipping = $(".cart-box-full .btn-continue");
const btnFinishOrder = $(".btn-finish-order");
const IconFinishOrder = $(".order-res-icon");
const orderRes = $(".order-respon");
const paymentEle = $(".payment");
const btnBackToCart = $(".btn-to-cart");
const productsPriceEle = $(".products-price");
const totalPriceEle = $(".price-total-end");
const shippingPriceEle = $(".shipping-price");
const shipValue = $('input[name="ship"]:checked');
const cartTotalPrice = $(".cart-total-price span");
const shipInfo = $(".ship-info");
const iconBackToCart = $(".icon-back");

// prevent scale and zoom on mobile devices
document.addEventListener(
  "touchmove",
  function (event) {
    event = event.originalEvent || event;
    if (event.scale !== 1) {
      event.preventDefault();
    }
  },
  false
);

const app = {
  currentProductIndex: 1,
  cart: [],
  products: [],
  orderRes: {},
  currentProduct: {},
  cartLocal: {
    getCartLocal: function () {
      const data = window.localStorage.getItem(CART_LOCAL);
      app.cart = JSON.parse(data) || [];
    },
    setCartLocal: function (cart) {
      window.localStorage.setItem(CART_LOCAL, JSON.stringify(cart));
    },
  },
  getProductsApi: async function () {
    const res = await fetch("https://berequirement.herokuapp.com/products");
    const { data } = await res.json();
    this.products = data;
    this.currentProduct = this.products[this.currentProductIndex - 1];
    return data;
  },
  handleEvents: function () {
    // change product when click btn
    productCard.addEventListener("click", function (e) {
      const nodeBtn = e.target.closest(".btn-select-item:not(.selected)");
      if (nodeBtn) {
        app.currentProductIndex = Number(e.target.dataset.index);
        app.currentProduct = app.products[app.currentProductIndex - 1];
        app.renderProducts();
      }
    });
    // close nav bar
    closeBtnNav.forEach((e) => {
      e.addEventListener("click", function () {
        navBar.classList.remove("show-nav");
        cartBox.classList.add("hidden");
        cartFullBox.classList.add("hidden");
        paymentEle.classList.add("hidden");
      });
    });
    // show nav bar
    menuBtn.addEventListener("click", function () {
      navBar.classList.add("show-nav");
    });
    // handle show toast when click btn buy
    BtnBuy.addEventListener("click", function () {
      if (app.cart.length !== 0) {
        const sameProduct = app.cart.find((e) => e.code === app.currentProduct.code);
        const haveSameProduct = Boolean(sameProduct);
        const thisProduct = haveSameProduct
          ? { ...sameProduct, quantity: ++sameProduct.quantity }
          : { ...app.currentProduct, quantity: 1 };
        const newCart = app.cart.filter((e) => e.code !== app.currentProduct.code);
        app.cart = [...newCart, thisProduct];
      } else {
        app.cart = [
          {
            ...app.currentProduct,
            quantity: 1,
          },
        ];
      }
      app.cartLocal.setCartLocal(app.cart);
      app.handleBtnBuy();
      app.toggleToast();
      app.toggleCartNull();
      app.renderCartLength();
      app.renderCartBox();
    });
    //handle show cart-box
    cartIcon.addEventListener("click", function () {
      if (window.innerWidth > 480) {
        cartBox.classList.toggle("hidden");
      } else {
        cartFullBox.classList.toggle("hidden");
      }
    });
    //  handle logic cart
    [cartContent, cartFullContent].forEach((e) => {
      e.addEventListener("click", function (e) {
        //handle delete product in cart
        const product = e.target.closest(".cart-item");
        const productCode = product.dataset.index;
        const deleteBtn = e.target.closest(".delete-product-btn");
        // get this product clicked
        const clickedProduct = app.cart.find((e) => e.code === productCode);
        const clickedProductIndex = app.cart.findIndex((e) => e.code === productCode);
        const deleteProduct = () => {
          app.cart = [];
          app.renderCartLength();
          app.cartLocal.setCartLocal([]);
          app.toggleCartNull();
          product.remove();
          app.renderCartBox();
          app.renderPricePay();
        };
        if (deleteBtn) {
          deleteProduct();
        }
        // handle quantity change
        const plusBtn = e.target.closest(".btn-plus");
        const subBtn = e.target.closest(".btn-sub");
        if (plusBtn) {
          app.cart[clickedProductIndex] = { ...clickedProduct, quantity: ++clickedProduct.quantity };
          app.cartLocal.setCartLocal(app.cart);
          app.renderCartLength();
          app.renderCartBox();
        }
        if (subBtn) {
          if (clickedProduct.quantity > 1) {
            app.cart[clickedProductIndex] = { ...clickedProduct, quantity: --clickedProduct.quantity };
            app.cartLocal.setCartLocal(app.cart);
            app.renderCartBox();
            app.renderCartLength();
          } else {
            deleteProduct();
          }
        }
      });
    });
    // handle lick btn checkout cart
    btnCheckout.addEventListener("click", function () {
      if (app.cart.length > 0) {
        cartFullBox.classList.remove("hidden");
        cartBox.classList.add("hidden");
      } else {
        cartBox.classList.add("hidden");
      }
    });
    //hanlde btn continue to shipping
    btnContinueShipping.addEventListener("click", function () {
      cartFullBox.classList.add("hidden");
      if (app.cart.length !== 0) {
        paymentEle.classList.remove("hidden");
      }
    });
    // handle onClick btn finish shipping
    btnFinishOrder.addEventListener("click", function () {
      orderRes.classList.add("hidden");
    });
    // handle onClick btn back to cart
    btnBackToCart.addEventListener("click", function () {
      paymentEle.classList.add("hidden");
      cartFullBox.classList.remove("hidden");
    });
    // change pay price when change chip type
    for (match in $$('input[name="ship"]')) {
      $$('input[name="ship"]')[match].onchange = function () {
        app.renderPricePay(this.value);
      };
    }
    iconBackToCart.addEventListener("click", function () {
      paymentEle.classList.add("hidden");
      cartFullBox.classList.remove("hidden");
    });
  },
  handleBtnBuy: function () {
    if (app.cart.length > 0) {
      BtnBuy.innerText = "Buy More";
    } else {
      BtnBuy.innerText = "Buy Now";
    }
  },
  toggleToast: function () {
    toastWrapper.classList.toggle("show-toast");
    setTimeout(() => {
      toastWrapper.classList.toggle("show-toast");
    }, 3000);
  },
  toggleCartNull: function () {
    if (app.cart.length === 0) {
      cartNull.forEach((e) => {
        e.classList.remove("hidden");
      });
      btnCheckout.innerText = "Back to shopping";
      btnContinueShipping.innerText = "Back to shopping";
    } else {
      cartNull.forEach((e) => {
        e.classList.add("hidden");
      });
      btnCheckout.innerText = "Check out";
      btnContinueShipping.innerText = "Continue to shipping";
    }
  },
  updateQuantityItem: function () {
    let cartQuantity = 0;
    app.cart.forEach((e) => {
      cartQuantity += e.quantity;
    });
    if (cartQuantity === 0) {
      $(".quantityItem").innerText = `0 Item`;
    } else if (cartQuantity === 1) {
      $(".quantityItem").innerText = `${cartQuantity} Item`;
    } else {
      $(".quantityItem").innerText = `${cartQuantity} Items`;
    }
  },
  renderPricePay: function (shipName) {
    const productsPrice = app.cart.reduce((sum, e) => {
      return sum + +e.price;
    }, 0);
    let shipPrice = 10;
    switch (shipName) {
      case "Regular Delivery":
        shipPrice = 0;
        break;
      case "Express Delivery":
        shipPrice = 10;
        break;
      case "VIP Delivery":
        shipPrice = 20;
        break;
      default:
        break;
    }
    shippingPriceEle.innerText = `$${shipPrice}`;
    const totalPrice = productsPrice + shipPrice;
    productsPriceEle.innerText = `$${productsPrice}`;
    totalPriceEle.innerText = `$${totalPrice}`;
  },
  renderCartBox: function () {
    const htmls = app.cart.map((e) => {
      return `
        <div class="cart-item" data-index=${e.code}>
          <img class="product-img" src="${e.image}" alt="${e.name}">
          <div class="cart-item_info">
            <div class="cart-item_header">
              <span class="product-title">
                ${e.name}
              </span>
              <img class="delete-product-btn" src="./assets/Icons/deleteIcon.svg" alt="delete this product">
            </div>
            <div class="product-content">
              <span class="name">
                #${e?.type?.toUpperCase()}
              </span>
              <div class="main">
                <span class="price">
                  $${e.price}
                </span>
                <div class="product-quantity">
                  <img class="btn-sub" src="./assets/Icons/SubIcon.svg" alt="">
                  <span class="quantity">${e.quantity}</span>
                  <img class="btn-plus" src="./assets/Icons/PlusIcon.svg" alt="">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    app.updateQuantityItem();
    app.renderPricePay();
    cartContent.innerHTML = htmls.join("");
    cartFullContent.innerHTML = htmls.join("");
    cartTotalPrice.innerText = `$${app.cart.reduce((sum, e) => {
      return sum + +e.price;
    }, 0)}`;
  },
  renderCartLength: function () {
    let cartQuantity = 0;
    if (this.cart.length > 0) {
      app.cart.forEach((e) => {
        cartQuantity += e.quantity;
      });
      cartLength.classList.remove("hidden");
      cartLength.innerText = `${cartQuantity}`;
    } else {
      cartLength.classList.add("hidden");
    }
  },
  renderProducts: async function () {
    if (!this.products.length) {
      this.products = await this.getProductsApi();
    }
    // create btn change product
    const htmlControls = Array(this.products.length)
      .fill(1)
      .map((_, i) => {
        return `<div class="btn-select-item ${this.currentProductIndex === i + 1 ? "selected" : ""}" data-index="${
          i + 1
        }"></div>`;
      });

    productInfo.innerHTML = `
      <p class="product-name">#Dino Ghost ${this.currentProduct.name}</p>
      <p class="product-code">Item no. ${this.currentProduct.code}</p>
      <p class="product-type">Item Type: ${this.currentProduct.type}</p>
      <p class="product-price">$${this.currentProduct.price}</p>
      `;

    productPreview.innerHTML = `
      <img class="product-img" src="${this.currentProduct.image}" alt="#Dino Ghost ${this.currentProduct.name}">
      <div class="controls">
        ${htmlControls.join("")}
      </div>
      `;
  },
  start: function () {
    this.cartLocal.getCartLocal();
    this.renderCartBox();
    this.toggleCartNull();
    this.renderProducts();
    this.renderCartLength();
    this.handleEvents();
    this.renderPricePay();
    this.updateQuantityItem();
  },
};

app.start();
