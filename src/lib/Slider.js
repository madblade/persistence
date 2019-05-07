"use strict";

function Slider(scene)
{

    this.scene = scene;

    // Format:
    // { (object)
    // meshes: [ [mesh1a, mesh1b, mesh1c], mesh2, [mesh3a, [mesh3a1, mesh3a2]] ],
    // transition: 'sharp', 'fade', 'x', 'y', 'z'
    // }
    this.slides = [[[ ]]];

    this.currentSlide = -1;

    this.transiting = false;

    this.activeMeshes = [

    ];

}

Slider.prototype.flatten = function(array)
{
    let toString = Object.prototype.toString;
    let arrayTypeStr = '[object Array]';

    let result = [];
    let nodes = array.slice();
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

Slider.prototype.computeBounds = function(array, index)
{
    let flat = [];
    if (!array.length) return flat;

    let toString = Object.prototype.toString;
    let arrayTypeStr = '[object Array]';

    let bounds = [];
    let nodes = array.slice();
    let node = nodes.shift();

    // Flatten
    do {
        if (node === 'x') {
            bounds.push('x');
            continue; // goes down to the while statement
        }

        if (toString.call(node) === arrayTypeStr) {
            bounds.push(node.length);
            nodes.splice(0, 0, ...node, 'x');
        } else {
            bounds.push('e');
            flat.push(node);
        }
    } while (nodes.length && (node = nodes.shift()) !== undefined);

    // console.log(bounds);

    // Search bounds
    let indexStart = 0;
    let indexEnd = 0;
    let numberElementsToRead = 0;
    let numberElementsRead = 0;
    let testIndex = 0;
    for (let i = 0; i < bounds.length; ++i) {
        let b = bounds[i];
        if (b === 'e') {
            testIndex++;
            numberElementsRead++;
        } else if (b !== 'x') {
            indexStart = i;
            numberElementsToRead = b;
            numberElementsRead = 0;
        } else if (b === 'x') {
            // Get last opener
            let nbEnd = 1;
            let nbStart = 0;
            numberElementsRead = 1;
            for (let j = indexStart - 1; j > 0; --j) {
                if (bounds[j] === 'e') {
                    if (nbEnd - nbStart === 1) numberElementsRead++;
                }
                else if (bounds[j] === 'x') {
                    if (nbEnd - nbStart === 1) numberElementsRead++;
                    nbEnd++;
                }
                else {
                    nbStart++;
                }
                if (nbStart === nbEnd) {
                    indexStart = j;
                    numberElementsToRead = bounds[j];
                    break;
                }
            }
        }

        if (testIndex === index + 1) {
            indexEnd = indexStart;
            if (numberElementsToRead < 1)
                break;
            if (numberElementsRead === numberElementsToRead) {
                indexEnd = i;
                break;
            }

            for (let j = i + 1; j < bounds.length; ++j) {
                if (bounds[j] === 'e') {
                    numberElementsRead++;
                } else if (bounds[j] !== 'x') {
                    let nbStarts = 1;
                    let nbEnd = 0;
                    // Fast-forward inner array.
                    for (let k = j + 1; k < bounds.length; ++k) {
                        if (bounds[k] === 'e') {}
                        else if (bounds[k] === 'x') nbEnd++;
                        else nbStarts++;

                        if (nbEnd === nbStarts) {
                            j = k;
                            break;
                        }
                    }
                    numberElementsRead++;
                }

                if (numberElementsRead >= numberElementsToRead) {
                    indexEnd = j;
                    break;
                }
            }

            break;
        }
    }

    // Count number of os
    let elementStart = 0;
    for (let i = 0; i < indexStart; ++i) {
        if (bounds[i] === 'e') elementStart++;
    }
    let elementEnd = 0;
    for (let i = 0; i < indexEnd; ++i) {
        if (bounds[i] === 'e') elementEnd++;
    }

    return [elementStart, elementEnd];
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
    this.slides[0][0].push(slide);
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

Slider.prototype.removeMesh = function(mesh) {
    this.scene.remove(mesh);
    let am = this.activeMeshes;
    for (let i = 0; i < am.length; ++i) {
        if (am[i] === mesh) {
            this.activeMeshes.splice(i, 1);
            break;
        }
    }
};

Slider.prototype.addMesh = function(mesh) {
    this.scene.add(mesh);
    this.activeMeshes.push(mesh);
};

Slider.prototype.clearActiveMeshes = function() {
    let am = this.activeMeshes;
    for (let i = 0; i < am.length; ++i) {
        this.scene.remove(am[i]);
    }
    this.activeMeshes = [];
};

Slider.prototype.transition = function(
    oldSlideIndex, newSlideIndex, backwards)
{
    console.log(oldSlideIndex + " -> " + newSlideIndex);
    let oldSlide;
    let newSlide;

    if (oldSlideIndex >= 0 &&
        ((oldSlide = this.getSlideAt(oldSlideIndex)) !== undefined))
    {

        let slides = this.slides;
        let bounds = this.computeBounds(slides, oldSlideIndex);
        // console.log('## bounds ##');
        console.log(bounds);
        console.log(oldSlideIndex);

        if (oldSlideIndex === bounds[1] && !backwards) {
            for (let slideId = bounds[0]; slideId <= bounds[1]; ++slideId) {
                this.removeMesh(this.getSlideAt(slideId).mesh);
            }
        } else if (backwards) {
            this.removeMesh(oldSlide.mesh);
        }

        if (oldSlide.request) {
            oldSlide.request(false);
        }
    }

    if (newSlideIndex >= 0 &&
        newSlideIndex < this.computeNbSlides() &&
        ((newSlide = this.getSlideAt(newSlideIndex)) !== undefined))
    {

        let slides = this.slides;
        let bounds = this.computeBounds(slides, newSlideIndex);

        if (newSlideIndex === bounds[1] && backwards) {
            for (let slideId = bounds[0]; slideId <= bounds[1]; ++slideId) {
                this.addMesh(this.getSlideAt(slideId).mesh);
            }
        } else {
            this.addMesh(newSlide.mesh);
        }

        if (newSlide.request) {
            newSlide.request(true);
        }
    }

    this.transiting = false;
};

export default Slider;
