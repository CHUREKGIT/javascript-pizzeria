/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

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

      //multiple price depends on quantity
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;

      

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
      
    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('Amount Widget', thisWidget);
      console.log('constructor element,', element);

      
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

      const event = new Event('updated');

      thisWidget.element.dispatchEvent(event);
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


    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);


      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
