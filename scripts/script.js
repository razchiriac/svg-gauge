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
  
    this.markerLeft = $('#marker-left');
    this.markerRight = $('#marker-right');
    
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
    
    this.range = 120;
  };
  
  init() {
    // TODO: method to init markers
    this.markerLeft.hide();
    this.markerRight.hide();
    
    this.initRedzones();
    this.setRedzoneRight(25);
    this.setRedzoneLeft(20);
    this.ignite();
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
  
  // TODO: rotate redzone to the left side. Reflect over y axis ?
  setRedzoneLeft(range, offset = 0) {
    this.redzoneLeft.drawLength = this.redzoneLeft.pathLength * range / 300;
    this.redzoneLeft.path.style.strokeDashoffset = this.redzoneLeft.pathLength - this.redzoneLeft.drawLength;
    let startOffset = 30 + (this.range * (offset / 100) + (range / 100 * this.range));
    SVG.wrap(this.redzoneLeft.selector).transform({rotation: startOffset});
  };
  
  setRedzoneRight(range, offset = 0) {
    this.redzoneRight.drawLength = this.redzoneRight.pathLength * range / 300;
    this.redzoneRight.path.style.strokeDashoffset = this.redzoneRight.pathLength - this.redzoneRight.drawLength;
    let startOffset = -30 - (this.range * (offset / 100));
    SVG.wrap(this.redzoneRight.selector).transform({rotation: startOffset});
  };
  
  moveRightHandTo(degree, easing = '<>', duration = 1000) {
    this.rightHand.animate({ ease: easing, duration: duration }).transform({rotation: degree});
  };
  moveLeftHandTo(degree, easing = '<>', duration = 1000) {
    this.leftHand.animate({ ease: easing, duration: duration }).transform({rotation: degree});
  };
  
  ignite() {
    this.moveLeftHandTo(this.leftHandDegRange[1]);
    this.moveRightHandTo(this.rightHandDegRange[1]);
    
    this.moveLeftHandTo(this.leftHandDegRange[0]);
    this.moveRightHandTo(this.rightHandDegRange[0]);
  };
  
}

let gauge = new Gauge();
gauge.init();
