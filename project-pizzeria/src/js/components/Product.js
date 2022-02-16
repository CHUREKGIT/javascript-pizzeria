import {select, classNames, templates} from '../settings.js'; 
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true, 
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;