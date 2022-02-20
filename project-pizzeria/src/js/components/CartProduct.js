import {select} from '../settings.js'; 
import AmountWidget from './AmountWidget.js';


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

  getData(){

    const thisCartProduct = this;

    const cartProductOrder = {};

    cartProductOrder.name = thisCartProduct.name;
    cartProductOrder.id = thisCartProduct.id;
    cartProductOrder.amount = thisCartProduct.amount;
    cartProductOrder.params = thisCartProduct.params;
    cartProductOrder.price = thisCartProduct.price;
    cartProductOrder.priceSingle = thisCartProduct.priceSingle;

  }

}

export default CartProduct;
