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
          max: 400
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
    this.redzoneLeft = {
      selector: $('#redzone-left'),
      path: null,
      pathLength: 0
    };
    this.redzoneRight = {
      selector: $('#redzone-right'),
      path: null,
      pathLength: 0
    };
    
    this.range = 120;
  };
  
  init() {
    this.initRedzones();
    this.rightRedzone(50,50);
    this.leftRedzone(1000,250);
    this.initMarkers();
    this.rightMarker(350);
    this.leftMarker(2000);
    this.ignite();
    this.leftHand(1500);
    this.rightHand(250);
  };
  
  initRedzones() {
    this.redzoneLeft.path = this.redzoneLeft.selector.get(0);
    this.redzoneLeft.pathLength = this.redzoneLeft.path.getTotalLength();
    this.redzoneLeft.path.style.strokeDasharray = this.redzoneLeft.pathLength + ' ' + this.redzoneLeft.pathLength;
    this.redzoneLeft.path.style.strokeDashoffset = this.redzoneLeft.pathLength;
    
    this.redzoneRight.path = this.redzoneRight.selector.get(0);
    this.redzoneRight.pathLength = this.redzoneRight.path.getTotalLength();
    this.redzoneRight.path.style.strokeDasharray = this.redzoneRight.pathLength + ' ' + this.redzoneRight.pathLength;
    this.redzoneRight.path.style.strokeDashoffset = this.redzoneRight.pathLength;
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
    if (arguments.length > 0) {
      this.redzones.left.range = range;
      this.redzones.left.offset = offset;
      this.redzoneLeft.drawLength = this.redzoneLeft.pathLength * range / this.hands.left.values.max / 3;
      this.redzoneLeft.path.style.strokeDashoffset = this.redzoneLeft.pathLength - this.redzoneLeft.drawLength;
      let startOffset = 30 + (this.range * (offset / this.hands.left.values.max) + (range / this.hands.left.values.max * this.range));
      SVG.wrap(this.redzoneLeft.selector).transform({rotation: startOffset});
    } else {
      return [this.redzones.left.range, this.redzones.left.offset];
    }
  };
  rightRedzone(range, offset = 0) {
    if (arguments.length > 0) {
      this.redzones.right.range = range;
      this.redzones.right.offset = offset;
      this.redzoneRight.drawLength = this.redzoneRight.pathLength * range / this.hands.right.values.max / 3;
      this.redzoneRight.path.style.strokeDashoffset = this.redzoneRight.pathLength - this.redzoneRight.drawLength;
      let startOffset = -30 - (this.range * (offset / this.hands.right.values.max));
      SVG.wrap(this.redzoneRight.selector).transform({rotation: startOffset});
    } else {
      return [this.redzones.right.range, this.redzones.right.offset];
    }
  };
  
  leftMarker(value) {
    if (arguments.length > 0) {
      this.markers.left.currentValue = value;
      this.markers.left.drawLength = 2;
      this.markers.left.path.style.strokeDashoffset = this.markers.left.pathLength - this.markers.left.drawLength;
      let startOffset = 30 + (this.range * (value / this.hands.left.values.max) );
      SVG.wrap(this.markers.left.selector).transform({rotation: startOffset});
    } else {
      return this.markers.left.currentValue;
    }
  };
  rightMarker(value) {
    if (arguments.length > 0) {
      this.markers.right.currentValue = value;
      this.markers.right.drawLength = 2;
      this.markers.right.path.style.strokeDashoffset = this.markers.right.pathLength - this.markers.right.drawLength;
      let startOffset = -30 - (this.range * (value / this.hands.right.values.max));
      SVG.wrap(this.markers.right.selector).transform({rotation: startOffset});
    } else {
      return this.markers.right.currentValue;
    }
  };
  
  rightHand(value) {
    if (arguments.length > 0) {
      this.hands.right.currentValue = value;
      let location = this.hands.right.currentValue / this.hands.right.values.max * 120;
      this.hands.right.selector.animate({ 
        ease: this.hands.right.moveEasing, 
        duration: this.hands.right.moveDuration 
      }).transform({rotation: this.hands.right.degrees.min - location});
    } else {
      return this.hands.right.currentValue;
    }
  };
  leftHand(value) {
    if (arguments.length > 0) {
      this.hands.left.currentValue = value;
      let location = this.hands.left.currentValue / this.hands.left.values.max * 120;
      this.hands.left.selector.animate({ 
        ease: this.hands.left.moveEasing, 
        duration: this.hands.left.moveDuration 
      }).transform({rotation: this.hands.left.degrees.min + location});
    } else {
      return this.hands.left.currentValue;
    }
  };
  
  ignite() {
    this.leftHand(4000);
    this.rightHand(400);
    this.leftHand(0);
    this.rightHand(0);
  };
  
}

let gauge = new Gauge();
gauge.init();
