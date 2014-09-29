


Unison = (function() {

  'use strict';

  var win = window;
  var doc = document;
  var head = doc.head;
  var eventCache = {};
  var unisonReady = false;
  var currentBP;

  var util = {
    parseMQ : function(el) {
      var str = win.getComputedStyle(el, null).getPropertyValue('font-family');
      return str.replace(/"/g, '').replace(/'/g, '');
    },
    debounce : function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        }, wait);
        if (immediate && !timeout) {
          func.apply(context, args);
        }
      };
    },
    isObject : function(e) { return typeof e === 'object'; },
    isUndefined : function(e) { return typeof e === 'undefined'; }
  };

  var events = {
    on : function(event, callback) {
      if ( !util.isObject(eventCache[event]) ) {
        eventCache[event] = [];
      }
      eventCache[event].push(callback);
    },
    emit : function(event, data) {
      if ( util.isObject(eventCache[event]) ) {
        var eventQ = eventCache[event].slice();
        for ( var i = 0; i < eventQ.length; i++ ) {
          eventQ[i].call(this, data);
        }
      }
    }
  };
  var makeNum = function(str){
    return +(str.replace('px',''));
  };
  var breakpoints = {
    all : function() {
      var BPs = {};
      var allBP = util.parseMQ(doc.querySelector('title')).split(',');
      for ( var i = 0; i < allBP.length; i++ ) {
        var mq = allBP[i].trim().split(' ');
        BPs[mq[0]] = makeNum(mq[1]);
      }
      return ( unisonReady ) ? BPs : null ;
    },
    now : function(callback) {
      var nowBP = util.parseMQ(head).split(' ');
      var now = {
        name : nowBP[0],
        width : makeNum(nowBP[1])
      };
      return ( unisonReady ) ? (( util.isUndefined(callback) ) ? now : callback(now)) : null ;
    },
    update : function() {
      breakpoints.now(function(bp) {
        if ( bp.name !== currentBP ) {
          events.emit(bp.name);
          events.emit('change', bp);
          currentBP = bp.name;
        }
      });
    }
  };

  var initialize = function(){
    win.onresize = util.debounce(breakpoints.update, 100);
  };
  // var ref = win.onload;
  // win.onload = (function(ref) {
  //     return function(element,attrs) {
  //         breakpoints.update();
  //         return ref.apply(this, arguments);
  //     };
  // })(ref);



  var init =  function(){
    unisonReady = win.getComputedStyle(head, null).getPropertyValue('clear') !== 'none';
  };

  if (document.readyState == "complete" || document.readyState == "loaded") {
       init()
  } else {
    doc.addEventListener('DOMContentLoaded', function(){
      init();
    });
  }

  return {
    fetch : {
      all : breakpoints.all,
      now : breakpoints.now
    },
    on : events.on,
    emit : events.emit,
    util : {
      debounce : util.debounce,
      isObject : util.isObject,
    },
    intialize: initialize,
    breakpoints: breakpoints,
    update: breakpoints.update
  };

})();
