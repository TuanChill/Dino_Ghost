const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const productCard = $(".content");

const app = {
  currentProductIndex: 1,
  products: [],
  getProductsApi: async function () {
    const res = await fetch("https://berequirement.herokuapp.com/products");
    const { data } = await res.json();
    this.products = data;
    return data;
  },
  handleEvents: function () {
    // change product when click btn
    productCard.addEventListener("click", function (e) {
      const nodeBtn = e.target.closest(".btn-select-item:not(.selected)");
      if (nodeBtn) {
        app.currentProductIndex = Number(e.target.dataset.index);
        app.renderProducts();
      }
    });
  },
  renderProducts: async function () {
    if (!this.products.length) {
      this.products = await this.getProductsApi();
    }
    const currentProduct = this.products[this.currentProductIndex - 1];

    // create btn change product
    const htmlControls = Array(this.products.length)
      .fill(1)
      .map((_, i) => {
        return `<div class="btn-select-item ${this.currentProductIndex === i + 1 ? "selected" : ""}" data-index="${
          i + 1
        }"></div>`;
      });

    const htmls = `
    <div class="product-info">
      <p class="product-name">#Dino Ghost ${currentProduct.name}</p>
      <p class="product-code">Item no. ${currentProduct.code}</p>
      <p class="product-type">Item Type: ${currentProduct.type}</p>
      <p class="product-price">$${currentProduct.price}</p>
      <button class="btn-buy">Buy Now</button>
    </div>
    <div class="product-preview">
      <img class="product-img" src="${currentProduct.image}" alt="#Dino Ghost ${currentProduct.name}">
      <div class="controls">
        ${htmlControls.join("")}
      </div>
    </div>`;
    productCard.innerHTML = htmls;
  },
  start: function () {
    this.renderProducts();
    this.handleEvents();
  },
};

app.start();
