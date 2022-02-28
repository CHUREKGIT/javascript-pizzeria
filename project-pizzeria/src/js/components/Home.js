import {select, templates, classNames} from '../settings.js'; 


class Home {
  constructor(){
    const thisHome = this;

    thisHome.getElements();
    thisHome.renderPage();
    thisHome.dom.link = document.querySelectorAll(select.home.links);
    for( let link of thisHome.dom.link){
      link.addEventListener('click', function(event){
        const clickElement = this;
        event.preventDefault();
        // get attribute page
        const id = clickElement.getAttribute('href').replace('#','');
        //run thisApp.activePage
        thisHome.activatePage(id);
        //change url hash
        window.location.hash = '#/' +id;
      });
    }
  }
  renderPage(){
    const thisHome = this;
    thisHome.dom.container.innerHTML = templates.homePage();
  }
  getElements(){
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.container = document.querySelector(select.containerOf.home);
    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);
  }
  activatePage (pageId){
    const thisHome = this;
    for (let page of thisHome.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    // link active or remove link
    for (let link of thisHome.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#'+pageId
      );
    }
  }
}

export default Home;