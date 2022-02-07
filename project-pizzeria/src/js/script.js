/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data){

      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      
    }

    renderInMenu(){

      const thisProduct = this;

      
      /* Generate HTML  */
      const generateHtml = templates.menuProduct(thisProduct.data);

      /* create element usting utils.createDOMFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHtml);

      /* find menu container */
      const container = document.querySelector(select.containerOf.menu);

      /* insert html into container*/
      container.appendChild(thisProduct.element);

      /* */
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom = {};
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.price = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidget = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }

    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);      
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      });

    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

         
          // if optin is checked in form and is not default increase price
          if (formData[paramId].includes(optionId) && option['default'] != true ){

            // increase price
            price = price + option['price'];

            

          // if optin is not checked in form and is  default decrease price
          } else if (!formData[paramId].includes(optionId) && option['default'] == true){

            //decrease price
            price = price - option['price'];

          }

          const imgSelector = thisProduct.imageWrapper.querySelector('.'+paramId+'-'+optionId);

          //if img selector exist
          if (imgSelector){

            // if option is checked show img
            if (formData[paramId].includes(optionId)){
              imgSelector.classList.add(classNames.menuProduct.imageVisible);

            // if not remove img
            } else{
              imgSelector.classList.remove(classNames.menuProduct.imageVisible);
            }
            
          }
              
        }
      }

      //update thisproduct object of price
      thisProduct.priceSingle = price;

      //multiple price depends on quantity
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.dom.price.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidget);

      thisProduct.dom.amountWidget.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
      
    }

    addToCart(){
      const thisProduct = this;

      thisProduct.prepareCartProductParams();
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      productSummary.params = thisProduct.prepareCartProductParams();
  
      return productSummary;

    }

    prepareCartProductParams(){

      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);

      //empty object productParams
      const productParams = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for each category (paramId) create empty object
        productParams[paramId] = {};

        // for each category assign their name
        productParams[paramId].label = param['label'];

        // for each category option create empty object
        productParams[paramId].options = {};

        // for every option in this category
        for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          // if optin is checked in form
          if (formData[paramId].includes(optionId)){

            productParams[paramId].options[optionId] = option['label'];
          }
              
        }
      }

      return productParams;

    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element){

      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);


    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      if (newValue !== thisWidget.value && isNaN(value) == false && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax ){
        
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.value.input);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
      
        /* prevent default action for event */
        event.preventDefault();

        thisWidget.setValue(thisWidget.value - 1);
      
      
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
      
        /* prevent default action for event */
        event.preventDefault();

        thisWidget.setValue(thisWidget.value + 1);
     
     
      });
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles:true
      });

      thisWidget.element.dispatchEvent(event);
    }

    
  }

  class Cart {
    constructor(element){

      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();


    }

    getElements(element){

      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    }

    initActions(){

      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){

        /* prevent default action for event */
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });

      //bubbles
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      //bubbles for remove 
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

    }

    add(menuProduct){

      const thisCart = this;
      
      /* Generate HTML  */
      const generateHtml = templates.cartProduct(menuProduct);

      console.log('Genereted HTML', generateHtml);

      /* create element usting utils.createDOMFromHTML */
      const generateDOM = utils.createDOMFromHTML(generateHtml);

      /* insert html into container*/
      thisCart.dom.productList.appendChild(generateDOM);

      console.log(menuProduct);

      /* init CARTproduct class*/
      thisCart.products.push(new CartProduct(menuProduct, generateDOM));

      thisCart.update();
      


    }
    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;

      let subtotalPrice = 0;

      for (let product of thisCart.products){

        totalNumber += product.amount;
        subtotalPrice += product.price;

      }
      //check if cart is not empty
      if (thisCart.products.length != 0 ) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      }

      //udate html
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      for (let prices of thisCart.dom.totalPrice){
        prices.innerHTML = thisCart.totalPrice;
      }
      


        
    }

    remove(product){
      const thisCart = this;

      //find index of product
      const indexProduct = thisCart.products.indexOf(product);

      //remove product form products array
      thisCart.products.splice(indexProduct, 1);

      //update
      thisCart.update();

      //remove object from the html
      product.dom.wrapper.remove();
    }

  }

  class CartProduct {

    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElement(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      

      console.log(thisCartProduct);
    }
    getElement(element){
      const thisCartProduct = this;
      
      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }
    initAmountWidget(){
      const thisCartProduct = this;

      //Init Amount Widget class for dom object
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

        let price = thisCartProduct.priceSingle;

        let amount = thisCartProduct.amountWidget.value;
        
        //update price depends on value
        price *= amount;
        
        //update HTML
        thisCartProduct.dom.price.innerHTML = price;

        //update price in object
        thisCartProduct.price = price;
        thisCartProduct.amount = amount;

        
      });
      
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {

        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },

      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){

      const thisCartProduct = this;


      thisCartProduct.dom.edit.addEventListener('click', function(event){

        /* prevent default action for event */
        event.preventDefault();



      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){

        /* prevent default action for event */
        event.preventDefault();

        thisCartProduct.remove();
        

      });
    }



  }

  const app = {

    initMenu: function() {

      const thisApp = this;
    
      for(let product in thisApp.data.products){
        new Product(product, thisApp.data.products[product]);
      }
      
    },

    initData: function(){

      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function(){

      const thisApp = this;

      const cartElement = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElement);

    },


    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);


      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
