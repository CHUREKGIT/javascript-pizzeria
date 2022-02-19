import {settings, select, classNames, templates} from './settings.js'; 
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    //checking if id match to any page.id
    for (let page of thisApp.pages){
      if (page.id == idFromHash){

        pageMatchingHash = page.id; 
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for( let link of thisApp.navLinks){
      link.addEventListener('click', function(event){

        const clickElement = this;

        event.preventDefault();

        // get attribute page
        const id = clickElement.getAttribute('href').replace('#','');


        //run thisApp.activePage
        thisApp.activatePage(id);

        //change url hash
        window.location.hash = '#/' +id;

      });
    }
    
  },

  activatePage: function(pageId){

    const thisApp = this;

    // add class to active mathicn page and remove from not-matching
    for (let page of thisApp.pages){

      page.classList.toggle(classNames.pages.active, page.id == pageId);

    }

    // link active or remove link

    for (let link of thisApp.navLinks){

      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#'+pageId

      );

    }

  },

  initMenu: function() {

    const thisApp = this;
    
    for(let product in thisApp.data.products){
      new Product(thisApp.data.products[product].id, thisApp.data.products[product]);
    }
      
  },

  initData: function(){

    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        //save parsedResponse as 

        thisApp.data.products = parsedResponse;

        // inint Menu

        thisApp.initMenu(parsedResponse);
      });

  },

  initCart: function(){

    const thisApp = this;

    const cartElement = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart (cartElement);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){

    const thisApp = this;

    const bookingElement = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking (bookingElement);

  },


  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
