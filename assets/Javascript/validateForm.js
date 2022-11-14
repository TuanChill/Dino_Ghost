document.addEventListener("DOMContentLoaded", function () {
  // Mong muốn của chúng ta
  Validator({
    form: "#form-1",
    formGroupSelector: ".form-group",
    errorSelector: ".form-message",
    rules: [
      Validator.isRequired("#fullname"),
      Validator.isRequired("#email"),
      Validator.isEmail("#email"),
      Validator.isRequired("#phone"),
      Validator.isPhone("#phone"),
      Validator.isRequired("#address"),
    ],
    onSubmit: function (data) {
      // Call API
      async function postData(url = "", data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(data),
        });
        return response.json();
      }
      postData("https://berequirement.herokuapp.com/product/purchase", {
        shippingInformation: {
          fullName: data.fullname,
          email: data.email,
          phone: data.phone,
          address: data.address,
          shippingMethod: data.ship,
        },
        products: app.cart.map((e) => {
          return {
            code: e.code,
            quantity: e.quantity,
          };
        }),
      })
        .then((data) => {
          app.orderRes = data;
          paymentEle.classList.add("hidden");
          orderRes.classList.remove("hidden");
          btnFinishOrder.innerText = "Continue Shopping";
          IconFinishOrder.src = "./assets/Icons/success-icon.svg";
          app.cart = [];
          app.cartLocal.setCartLocal([]);
          app.renderCartBox();
          app.toggleCartNull();
          app.renderCartLength();
        })
        .catch((data) => {
          app.orderRes = data;
          paymentEle.classList.add("hidden");
          orderRes.classList.remove("hidden");
          btnFinishOrder.innerText = "Try again";
          IconFinishOrder.src = "./assets/Icons/fail-icon.svg";
        });
    },
  });
});

// Đối tượng `Validator`
function Validator(options) {
  // get element
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  const selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    let errorMessage;

    // Lấy ra các rules của selector
    const rules = selectorRules[rule.selector];

    // Lặp qua từng rule & kiểm tra
    // Nếu có lỗi thì dừng việc kiểm tra
    for (let i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
          break;
        default:
          // ktra lỗi
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    // check lỗi. nêu lỗi thì in ra lỗi
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }
    return !!errorMessage;
  }

  // Lấy element của form cần validate
  const formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      // Lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = !validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          const enableInputs = formElement.querySelectorAll("[name]");
          const formValues = Array.from(enableInputs).reduce((values, input) => {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(`input[name="${input.name}"]:checked`).value;
                break;
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }

            return values;
          }, {});
          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };

    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function () {
          const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        };
      });
    });
  }
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "This field is required";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || "Email is invalid";
    },
  };
};

Validator.isPhone = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      return regex.test(value) ? undefined : message || "Phone is invalid";
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue() ? undefined : message || "Not confirmed";
    },
  };
};
