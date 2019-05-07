"use strict";

function Slider(scene)
{

    this.scene = scene;

    // Format:
    // { (object)
    // meshes: [ [mesh1a, mesh1b, mesh1c], mesh2, [mesh3a, [mesh3a1, mesh3a2]] ],
    // transition: 'sharp', 'fade', 'x', 'y', 'z'
    // }
    this.slides = [

    ];

    this.currentSlide = -1;

    this.transiting = false;

}

Slider.prototype.flatten = function(array, mutable)
{
    let toString = Object.prototype.toString;
    let arrayTypeStr = '[object Array]';

    let result = [];
    let nodes = (mutable && array) || array.slice();
    let node;

    if (!array.length) {
        return result;
    }

    node = nodes.pop();

    do {
        if (toString.call(node) === arrayTypeStr) {
            nodes.push.apply(nodes, node);
        } else {
            result.push(node);
        }
    } while (nodes.length && (node = nodes.pop()) !== undefined);

    result.reverse(); // we reverse result to restore the original order
    return result;
};

Slider.prototype.computeNbSlides = function()
{
    let slides = this.slides;
    let flat = this.flatten(slides);
    return flat.length;
};

Slider.prototype.getSlideAt = function(index)
{
    let slides = this.slides;
    let flat = this.flatten(slides);
    return flat[index];
};

Slider.prototype.addSlide = function(slide)
{
    this.slides.push(slide);
};

Slider.prototype.onKeyDown = function(event)
{
    if (this.transiting) return;

    switch(event.keyCode) {
        case 33: // page up
        case 37: // left arrow
        case 81: // q
            this.transiting = true;
            this.previous();
            break;
        case 34: // page down
        case 39: // right arrow
        case 68: // d
            this.transiting = true;
            this.next();
            break;
        default:
    }
};

Slider.prototype.next = function()
{
    let nbSlides = this.computeNbSlides();
    let oldSlide = this.currentSlide;
    if (oldSlide < nbSlides) {
        this.currentSlide += 1;
        this.transition(oldSlide, this.currentSlide);
    } else {
        this.transiting = false;
    }
};

Slider.prototype.previous = function()
{
    let oldSlide = this.currentSlide;
    if (oldSlide >= 0) {
        this.currentSlide -= 1;
        this.transition(oldSlide, this.currentSlide, true);
    } else {
        this.transiting = false;
    }
};

Slider.prototype.transition = function(
    oldSlideIndex, newSlideIndex, backwards)
{
    console.log(oldSlideIndex + " -> " + newSlideIndex);
    if (oldSlideIndex >= 0) {
        let oldSlide = this.getSlideAt(oldSlideIndex);
        if (oldSlide && oldSlide.mesh) {
            this.scene.remove(oldSlide.mesh);
            if (oldSlide.request) {
                oldSlide.request(false);
            }
        } else if (oldSlide) {
            this.scene.remove(oldSlide);
        }
    }

    if (newSlideIndex >= 0 && newSlideIndex < this.computeNbSlides()) {
        let newSlide = this.getSlideAt(newSlideIndex);
        if (newSlide && newSlide.mesh) {
            this.scene.add(newSlide.mesh);
            if (newSlide.request) {
                newSlide.request(true);
            }
        } else if (newSlide) {
            this.scene.add(newSlide);
        }
    }

    this.transiting = false;
};

export default Slider;
