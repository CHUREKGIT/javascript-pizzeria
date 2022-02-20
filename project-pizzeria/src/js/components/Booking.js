import {select, templates} from '../settings.js'; 
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{

  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(container){

    const thisBooking = this;

    // placeholder for dom
    thisBooking.dom = {};

    //assign cointeiner to wrapper 
    thisBooking.dom.wrapper = container;

    /* Generate HTML  */
    const generateHtml = templates.bookingWidget();

    //assign HTML for wrapper
    thisBooking.dom.wrapper.innerHTML = generateHtml;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.dateInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets(){

    const thisBooking = this;

    //Init amoundWidget for people 
    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);

    //Init amoundWidget for hours 
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    //Init dataPicker widget
    thisBooking.dateWidget = new DatePicker (thisBooking.dom.dateInput);

    //Init HoursPicker widget
    thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourInput);

    //Listener for people
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      console.log('people update');
    });

    //Listener for hours
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      console.log('hours update');
    });

  }

}


export default Booking;