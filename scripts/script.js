"use strict";

SVG.wrap = function(node) {
    /* Wrap an existing node in an SVG.js element. This is a slight hack
     * because svg.js does not (in general) provide a way to create an
     * Element of a specific type (eg SVG.Ellipse, SVG.G, ...) from an
     * existing node and still call the Element's constructor.
     *
     * So instead, we call the Element's constructor and delete the node
     * it created (actually, just leaving it to garbage collection, since it
     * hasn't been inserted into the doc yet), replacing it with the given node.
     *
     * Returns the newly created SVG.Element instance.
     */
    if (node.length) node = node[0];    // Allow using with or without jQuery selections
    var element_class = capitalize(node.nodeName);
    try {
        var element = new SVG[element_class];
    } catch(e) {
        throw("No such SVG type '"+element_class+"'");
    }
    element.node = node;
    return element;
};
function capitalize(string) {
    if (!string) return string;
    return string[0].toUpperCase() + string.slice(1);
}

class Gauge {
  constructor() {
    this.numbers = {
      left: {
        selectors: [],
        values: []
      },
      right: {
        selectors: [],
        values: []
      }
    };
    this.hands = {
      left: {
        selector: SVG.wrap($('#left-hand-wrapper')),
        moveDuration: 1000,
        moveEasing: '<>',
        degrees: {
          min: -240,
          max: -120
        },
        values: {
          min: 0,
          max: 4000
        },
        currentValue: 0
      },
      right: {
        selector: SVG.wrap($('#right-hand-wrapper')),
        moveDuration: 1000,
        moveEasing: '<>',
        degrees: {
          min: 60,
          max: -60
        },
        values: {
          min: 0,
          max: 4000
        },
        currentValue: 0
      }
    };
    this.markers = {
      left: {
        selector: $('#marker-left'),
        path: null,
        pathLength: 0,
        currentValue: 0
      },
      right: {
        selector: $('#marker-right'),
        path: null,
        pathLength: 0,
        currentValue: 0
      }
    };
    this.redzones = {
      left: {
        selector: $('#redzone-left'),
        path: null,
        pathLength: 0,
        range: 0,
        offset: 0
      },
      right: {
        selector: $('#redzone-right'),
        path: null,
        pathLength: 0,
        range: 0,
        offset: 0
      }
    };
    
    this.range = 120;
  };
  
  init() {
    this.initNumbers();
    this.initRedzones();
    this.rightRedzone(500);
    this.leftRedzone(1000);
    this.initMarkers();
    this.rightMarker(1600);
    this.leftMarker(2000);
    this.ignite();
    this.leftHand(2500);
    this.rightHand(1200);
  };
  
  // creates selectors for all valuse left and right
  initNumbers() {
    let odds = [];
    for (let i = 43; i > 0; i-=2) {
      odds.push(i);
    }
    odds.forEach( value => {
    	let string = "#text-" + value + ">tspan";
    	if ( value >= 23 ) {
    		this.numbers.left.selectors.push(string);
        this.numbers.left.values.push($(string).text().trim());
    	} else {
    		this.numbers.right.selectors.push(string);
        this.numbers.right.values.push($(string).text().trim());
    	}
    });
  };
  
  generateNumbers(min, max, maxNumOfSteps = 11) {
    let step = 0;
    let range = max - min;
    for (let i = maxNumOfSteps - 1; i > 1; i--) {
      if (step === 0) {
        let newStep = range / i;
        if (newStep % 1 === 0) {
          step = newStep;
        }
      }
    }
    let newNumbers = [];
    for (let num = min; num <= max; num += step) {
      newNumbers.push(num);
    }
    return newNumbers;
  };
  
  leftNumbers(max) {
    // Current limitations: 
    // - numOfSteps always 11.
    // - min always 0.
    let min = 0;
    let maxNumOfSteps = 11;
    if (arguments.length > 0) {
      let numbers = this.generateNumbers(min, max, maxNumOfSteps);
      
      if (numbers.length === this.numbers.left.selectors.length) {
        this.numbers.left.selectors.forEach((selector, index) => {
          $(selector).text(numbers[index]);
        });
        this.hands.left.values.min = min;
        this.hands.left.values.max = max;
        this.leftMarker(this.markers.left.currentValue);
        this.leftRedzone(this.redzones.left.range, this.redzones.left.offset);
      }
      
      return numbers;
    }
    return this.numbers.left.values;
  };
  
  rightNumbers(max) {
    // Current limitations: 
    // - numOfSteps always 11.
    // - min always 0.
    let min = 0;
    let maxNumOfSteps = 11;
    if (arguments.length > 0) {
      let numbers = this.generateNumbers(min, max, maxNumOfSteps);
      
      if (numbers.length === this.numbers.right.selectors.length) {
        this.numbers.right.selectors.forEach((selector, index) => {
          $(selector).text(numbers[index]);
        });
        this.hands.right.values.min = min;
        this.hands.right.values.max = max;
        this.rightMarker(this.markers.right.currentValue);
        this.rightRedzone(this.redzones.right.range, this.redzones.right.offset);
      }
      
      return numbers;
    }
    return this.numbers.right.values;
  };
  
  initRedzones() {
    this.redzones.left.path = this.redzones.left.selector.get(0);
    this.redzones.left.pathLength = this.redzones.left.path.getTotalLength();
    this.redzones.left.path.style.strokeDasharray = this.redzones.left.pathLength + ' ' + this.redzones.left.pathLength;
    this.redzones.left.path.style.strokeDashoffset = this.redzones.left.pathLength;
    
    this.redzones.right.path = this.redzones.right.selector.get(0);
    this.redzones.right.pathLength = this.redzones.right.path.getTotalLength();
    this.redzones.right.path.style.strokeDasharray = this.redzones.right.pathLength + ' ' + this.redzones.right.pathLength;
    this.redzones.right.path.style.strokeDashoffset = this.redzones.right.pathLength;
  };
  
  initMarkers() {
    this.markers.left.path = this.markers.left.selector.get(0);
    this.markers.left.pathLength = this.markers.left.path.getTotalLength();
    this.markers.left.path.style.strokeDasharray = this.markers.left.pathLength + ' ' + this.markers.left.pathLength;
    this.markers.left.path.style.strokeDashoffset = this.markers.left.pathLength;
    this.markers.left.currentValue = 0;
    this.markers.right.path = this.markers.right.selector.get(0);
    this.markers.right.pathLength = this.markers.right.path.getTotalLength();
    this.markers.right.path.style.strokeDasharray = this.markers.right.pathLength + ' ' + this.markers.right.pathLength;
    this.markers.right.path.style.strokeDashoffset = this.markers.right.pathLength;
    this.markers.right.currentValue = 0;
  };
  
  leftRedzone(range, offset = 0) {
    if (arguments.length > 0 && range + offset <= this.hands.left.values.max) {
      this.redzones.left.range = range;
      this.redzones.left.offset = offset;
      this.redzones.left.drawLength = this.redzones.left.pathLength * range / this.hands.left.values.max / 3;
      this.redzones.left.path.style.strokeDashoffset = this.redzones.left.pathLength - this.redzones.left.drawLength;
      let startOffset = 30 + (this.range * (offset / this.hands.left.values.max) + (range / this.hands.left.values.max * this.range));
      SVG.wrap(this.redzones.left.selector).transform({rotation: startOffset});
    }
    return [this.redzones.left.range, this.redzones.left.offset];
  };
  rightRedzone(range, offset = 0) {
    if (arguments.length > 0 && range + offset <= this.hands.right.values.max) {
      this.redzones.right.range = range;
      this.redzones.right.offset = offset;
      this.redzones.right.drawLength = this.redzones.right.pathLength * range / this.hands.right.values.max / 3;
      this.redzones.right.path.style.strokeDashoffset = this.redzones.right.pathLength - this.redzones.right.drawLength;
      let startOffset = -30 - (this.range * (offset / this.hands.right.values.max));
      SVG.wrap(this.redzones.right.selector).transform({rotation: startOffset});
    }
    return [this.redzones.right.range, this.redzones.right.offset];
  };
  leftMarker(value) {
    if (arguments.length > 0 && value <= this.hands.left.values.max) {
      this.markers.left.currentValue = value;
      this.markers.left.drawLength = 2;
      this.markers.left.path.style.strokeDashoffset = this.markers.left.pathLength - this.markers.left.drawLength;
      let startOffset = 30 + (this.range * (value / this.hands.left.values.max) );
      SVG.wrap(this.markers.left.selector).transform({rotation: startOffset});
    }
    return this.markers.left.currentValue;
  };
  rightMarker(value) {
    if (arguments.length > 0 && value <= this.hands.right.values.max) {
      this.markers.right.currentValue = value;
      this.markers.right.drawLength = 2;
      this.markers.right.path.style.strokeDashoffset = this.markers.right.pathLength - this.markers.right.drawLength;
      let startOffset = -30 - (this.range * (value / this.hands.right.values.max));
      SVG.wrap(this.markers.right.selector).transform({rotation: startOffset});
    }
    return this.markers.right.currentValue;
  };
  rightHand(value) {
    if (arguments.length > 0 && value <= this.hands.right.values.max) {
      this.hands.right.currentValue = value;
      let location = this.hands.right.currentValue / this.hands.right.values.max * 120;
      this.hands.right.selector.animate({ 
        ease: this.hands.right.moveEasing, 
        duration: this.hands.right.moveDuration 
      }).transform({rotation: this.hands.right.degrees.min - location});
    }
    return this.hands.right.currentValue;
  };
  leftHand(value) {
    if (arguments.length > 0 && value <= this.hands.left.values.max) {
      this.hands.left.currentValue = value;
      let location = this.hands.left.currentValue / this.hands.left.values.max * 120;
      this.hands.left.selector.animate({ 
        ease: this.hands.left.moveEasing, 
        duration: this.hands.left.moveDuration 
      }).transform({rotation: this.hands.left.degrees.min + location});
    }
    return this.hands.left.currentValue;
  };
  
  ignite() {
    this.leftHand(this.hands.left.values.max);
    this.rightHand(this.hands.right.values.max);
    this.leftHand(0);
    this.rightHand(0);
  };
  
}

let gauge = new Gauge();
gauge.init();
