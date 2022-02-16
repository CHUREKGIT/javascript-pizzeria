import {select, classNames, templates, settings} from '../settings.js'; 
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

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

    //orders listner
    thisCart.dom.form.addEventListener('submit', function(event){

      /* prevent default action for event */
      event.preventDefault();

      //
      thisCart.sendOrder();

    });

  }

  add(menuProduct){

    const thisCart = this;
    
    /* Generate HTML  */
    const generateHtml = templates.cartProduct(menuProduct);

    /* create element usting utils.createDOMFromHTML */
    const generateDOM = utils.createDOMFromHTML(generateHtml);

    /* insert html into container*/
    thisCart.dom.productList.appendChild(generateDOM);

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

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    //prepare payload object
    const payload = {};

    

    payload.adress = thisCart.dom.form.elements['address'].value;
    payload.phone = thisCart.dom.form.elements['phone'].value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.dom.subtotalPrice.innerHTML;
    payload.totalNumber = thisCart.dom.totalNumber.innerHTML;
    payload.deliveryFee = thisCart.dom.deliveryFee.innerHTML;
    payload.products = [];

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }


    //Post because we want to post payloands
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options);

  }

}

export default Cart;