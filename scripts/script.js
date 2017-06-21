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
    this.rightHand = SVG.wrap($('#right-hand-wrapper'));
    this.leftHand = SVG.wrap($('#left-hand-wrapper'));
  
    this.markerLeft = {
      selector: $('#marker-left'),
      path: null,
      pathLength: 0
    };
    this.markerRight = {
      selector: $('#marker-right'),
      path: null,
      pathLength: 0
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
    
    this.leftHandDegRange = [-240,-120];
    this.rightHandDegRange = [60,-60];
    
    this.leftHandValueRange = [0,4000];
    this.rightHandValueRange = [0,400];
    
    this.range = 120;
  };
  
  init() {
    // TODO: method to init markers
    
    this.initRedzones();
    this.setRedzoneRight(50,50);
    this.setRedzoneLeft(1000,250);
    this.initMarkers();
    this.setMarkerRight(350);
    this.setMarkerLeft(2000);
    this.ignite();
    this.moveLeftHandTo(1500);
    this.moveRightHandTo(250);
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
    this.markerLeft.path = this.markerLeft.selector.get(0);
    this.markerLeft.pathLength = this.markerLeft.path.getTotalLength();
    this.markerLeft.path.style.strokeDasharray = this.markerLeft.pathLength + ' ' + this.markerLeft.pathLength;
    this.markerLeft.path.style.strokeDashoffset = this.markerLeft.pathLength;
    
    this.markerRight.path = this.markerRight.selector.get(0);
    this.markerRight.pathLength = this.markerRight.path.getTotalLength();
    this.markerRight.path.style.strokeDasharray = this.markerRight.pathLength + ' ' + this.markerRight.pathLength;
    this.markerRight.path.style.strokeDashoffset = this.markerRight.pathLength;
  };
  
  // TODO: Change inputs to make them based on actual range
  setRedzoneLeft(range, offset = 0) {
    this.redzoneLeft.drawLength = this.redzoneLeft.pathLength * range / this.leftHandValueRange[1] / 3;
    this.redzoneLeft.path.style.strokeDashoffset = this.redzoneLeft.pathLength - this.redzoneLeft.drawLength;
    let startOffset = 30 + (this.range * (offset / this.leftHandValueRange[1]) + (range / this.leftHandValueRange[1] * this.range));
    SVG.wrap(this.redzoneLeft.selector).transform({rotation: startOffset});
  };
  setRedzoneRight(range, offset = 0) {
    this.redzoneRight.drawLength = this.redzoneRight.pathLength * range / this.rightHandValueRange[1] / 3;
    this.redzoneRight.path.style.strokeDashoffset = this.redzoneRight.pathLength - this.redzoneRight.drawLength;
    let startOffset = -30 - (this.range * (offset / this.rightHandValueRange[1]));
    SVG.wrap(this.redzoneRight.selector).transform({rotation: startOffset});
  };
  
  setMarkerLeft(value) {
    this.markerLeft.drawLength = 2;
    this.markerLeft.path.style.strokeDashoffset = this.markerLeft.pathLength - this.markerLeft.drawLength;
    let startOffset = 30 + (this.range * (value / this.leftHandValueRange[1]) );
    SVG.wrap(this.markerLeft.selector).transform({rotation: startOffset});
  };
  setMarkerRight(value) {
    this.markerRight.drawLength = 2;
    this.markerRight.path.style.strokeDashoffset = this.markerRight.pathLength - this.markerRight.drawLength;
    let startOffset = -30 - (this.range * (value / this.rightHandValueRange[1]));
    SVG.wrap(this.markerRight.selector).transform({rotation: startOffset});
  };
  
  moveRightHandTo(value, easing = '<>', duration = 1000) {
    let location = value / this.rightHandValueRange[1] * 120;
    this.rightHand.animate({ ease: easing, duration: duration }).transform({rotation: this.rightHandDegRange[0] - location});
  };
  moveLeftHandTo(value, easing = '<>', duration = 1000) {
    let location = value / this.leftHandValueRange[1] * 120;
    this.leftHand.animate({ ease: easing, duration: duration }).transform({rotation: this.leftHandDegRange[0] + location});
  };
  
  ignite() {
    this.moveLeftHandTo(4000);
    this.moveRightHandTo(400);
    
    this.moveLeftHandTo(0);
    this.moveRightHandTo(0);
  };
  
}

let gauge = new Gauge();
gauge.init();
