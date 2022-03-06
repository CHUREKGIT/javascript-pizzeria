import {classNames, select, settings, templates} from '../settings.js';
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
        thisBooking.parseDate(bookings, eventsCurrent,eventsRepeat);
      });
  }
  parseDate(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.dateWidget.minDate;
    const maxDate = thisBooking.dateWidget.maxDate;
    for(let item of eventsRepeat){
      if (item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDom();
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    const hourConstTime = 0.5;
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+=hourConstTime){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(parseInt(table));
    }
  }
  render(container){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = container;
    thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.checkbox = thisBooking.dom.wrapper.querySelectorAll(select.booking.checkbox);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dateWidget = new DatePicker (thisBooking.dom.dateInput);
    thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourInput);
    //Listener for people - is it necessery?
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
    });
    //Listener for hours - is it necessery?
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDom();
    });
    for (let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        thisBooking.pickTable(table);
      });
    }
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  updateDom(){
    const thisBooking = this;
    thisBooking.date = thisBooking.dateWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvaible = false;
    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvaible = true;
    }
    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if( !allAvaible && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      table.classList.remove(classNames.table.active);
    }
  }
  pickTable(table){
    const thisBooking = this;
    for (let tb of thisBooking.dom.tables){
      tb.classList.remove(classNames.table.active);
    }
    if (!table.classList.contains(classNames.booking.tableBooked)) {
      table.classList.toggle(classNames.table.active);
      thisBooking.bookedTable = table.dataset.table;
    }else{
      alert('This table is reserved!');
    }
  }
  sendBooking(){
    const thisBooking = this; 
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {};

    payload.date = thisBooking.date;
    payload.hour = thisBooking.hourPicker.correctValue;
    payload.table = thisBooking.bookedTable;
    payload.duration = thisBooking.hoursWidget.correctValue;
    payload.ppl = thisBooking.peopleWidget.correctValue;
    payload.starters = [];
    payload.adress = thisBooking.dom.form.elements['address'].value;
    payload.phone = thisBooking.dom.form.elements['phone'].value;

    if (thisBooking.dom.form.elements['starter'][0].checked){
      payload.starters.push('water');
    }
    if (thisBooking.dom.form.elements['starter'][1].checked){
      payload.starters.push('bread');
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table))
      .then(alert('Reservation made'));
    console.log(thisBooking.booked);
  }
}

export default Booking;