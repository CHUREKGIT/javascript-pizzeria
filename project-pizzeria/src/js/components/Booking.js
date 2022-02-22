import {select, settings, templates} from '../settings.js';
import utils from '../utils.js'; 
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{

  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getDate();
  }

  getDate(){
    const thisBooking = this;

    //console.log(thisBooking);

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dateWidget.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    const urls = {
      booking:       settings.db.url + '/' +settings.db.booking + '?'+ params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' +settings.db.event + '?'+ params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' +settings.db.event + '?'+ params.eventsRepeat.join('&')

    };
    console.log(urls)

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseDate(bookings, eventsCurrent,eventsRepeat);
      });
  }

  parseDate(bookings, eventsCurrent,eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    console.log('this booking booke', thisBooking.booked);
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    console.log(date);

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] == {};
    }

    console.log(thisBooking);

    const startHour = utils.hourToNumber(hour);

    if(typeof thisBooking.booked[date][startHour] == 'undefined'){
      thisBooking.booked[date][startHour] == [];
    }

    thisBooking.booked[date][startHour].push(table);
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