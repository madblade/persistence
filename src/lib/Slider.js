"use strict";

import {Object3D} from "three";

function Slider(scene, camera, controls)
{

    this.scene = scene;
    this.camera = camera; // three.perspectivecamera
    this.controls = controls; // three.orbitcontrols

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

    this.needAnimation = [

    ];

    this.needIn = [

    ];

    this.needOut = [

    ];

    this.needCam = [

    ];

    this.time = 0;
    this.maxTime = 100;
    this.startTime = 0;
    this.maxTimeTransition = 10;
    this.maxTimeCameraTransition = 10;
    this.endOutAnimationCallback = null;
    this.endInAnimationCallback = null;
    this.backwards = false;

    this.lastBackwards = false;
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

    // Reset needs.
    let nbSlides = this.computeNbSlides();
    this.needAnimation = [];
    this.needIn = [];
    this.needOut = [];
    this.needCam = [];
    for (let i = 0; i < nbSlides; ++i)
    {
        this.needAnimation.push(false);
        this.needIn.push(false);
        this.needOut.push(false);
        this.needCam.push(false);
    }
};

Slider.prototype.onKeyDown = function(event)
{
    if (this.transiting) return;
    this.lastBackwards = this.backwards;

    switch (event.keyCode) {
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
        this.transitionStart(oldSlide, this.currentSlide);
    } else {
        this.transiting = false;
    }
};

Slider.prototype.previous = function()
{
    let oldSlide = this.currentSlide;
    if (oldSlide >= 0) {
        this.currentSlide -= 1;
        this.transitionStart(oldSlide, this.currentSlide, true);
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
    if (!(mesh instanceof Object3D))
        return;

    // Reset mesh post-transition
    console.log(mesh);
    this.resetMesh(mesh);
    this.scene.add(mesh);
    this.activeMeshes.push(mesh);
};

Slider.prototype.resetScale = function(mesh) {
    if (mesh.scale) {
        mesh.scale.x = 1;
        mesh.scale.y = 1;
        mesh.scale.z = 1;
    }
};

Slider.prototype.resetOpacity = function(mesh) {
    let material = null;

    if (mesh.material) {
        material = mesh.material;
    }
    else if (mesh.materials && mesh.materials[0])
    {
        material = mesh.materials[0];
    }
    else if (mesh.children) // Going down just one level.
    {
        let c = mesh.children;
        for (let i = 0; i < c.length; ++i) {
            let m = c[i].material;
            if (m && m.opacity) {
                m.transparent = true;
                m.opacity = 1;
                m.needsUpdate = true;
            }
        }
    }

    if (material) {
        material.transparent = true;
        material.opacity = 1;
        material.needsUpdate = true;
    }
};

Slider.prototype.resetMesh = function(mesh) {
    if (!mesh) return;
    this.resetScale(mesh);
    this.resetOpacity(mesh);
};

//
// Transition animations.
//

Slider.prototype.endOldSlideTransition = function(oldSlide, oldSlideIndex, bounds, backwards)
{
    if (oldSlideIndex === bounds[1] && !backwards) {
        for (let slideId = bounds[0]; slideId <= bounds[1]; ++slideId) {
            this.removeMesh(this.getSlideAt(slideId).mesh);
        }
    } else if (backwards) {
        this.removeMesh(oldSlide.mesh);
    }

    if (this.needOut[oldSlideIndex]) {
        this.needOut[oldSlideIndex] = false;
    }
};

Slider.prototype.endNewSlideTransition = function(newSlide, newSlideIndex)
{
    if (newSlide.animate) {
        this.time = 0;
        this.needAnimation[newSlideIndex] = true;
    }

    if (this.needIn[newSlideIndex]) {
        this.needIn[newSlideIndex] = false;
    }

    if (this.needCam[newSlideIndex]) {
        this.needCam[newSlideIndex] = false;
    }
};

Slider.prototype.transitionOut = function(
    oldSlideIndex, newSlideIndex, backwards)
{
    let oldSlide;
    let isManagingTransitionIn = false;

    if (oldSlideIndex >= 0 &&
        ((oldSlide = this.getSlideAt(oldSlideIndex)) !== undefined))
    {
        this.startTime = this.time;

        let slides = this.slides;
        let bounds = this.computeBounds(slides, oldSlideIndex);
        // console.log('## bounds ##');
        // console.log(bounds);
        // console.log(oldSlideIndex);

        if (oldSlide.animate) {
            this.needAnimation[oldSlideIndex] = false;
        }

        // TODO make transition out
        if (oldSlide.animateOut && !backwards) {
            this.endOutAnimationCallback = function() {
                console.log('ending out animation on ' + oldSlideIndex + ', ' + oldSlide);
                this.endOldSlideTransition(oldSlide, oldSlideIndex, bounds, backwards);

                this.transitionIn(newSlideIndex, backwards);
            }.bind(this);

            this.needOut[oldSlideIndex] = true;
            isManagingTransitionIn = true;

        }
        else
        {
            this.endOldSlideTransition(oldSlide, oldSlideIndex, bounds, backwards);
            isManagingTransitionIn = false;
        }

    }

    return isManagingTransitionIn;
};

Slider.prototype.transitionIn = function(
    newSlideIndex, backwards)
{
    let newSlide;
    let isMakingTransitionIn = false;

    if (newSlideIndex >= 0 &&
        newSlideIndex < this.computeNbSlides() &&
        ((newSlide = this.getSlideAt(newSlideIndex)) !== undefined))
    {
        this.startTime = this.time;

        let slides = this.slides;
        let bounds = this.computeBounds(slides, newSlideIndex);

        if (newSlideIndex === bounds[1] && backwards) {
            for (let slideId = bounds[0]; slideId <= bounds[1]; ++slideId) {
                this.addMesh(this.getSlideAt(slideId).mesh);
            }
        } else {
            this.addMesh(newSlide.mesh);
        }

        if (newSlide.animateIn && !backwards) {
            this.endInAnimationCallback = function() {
                console.log('ending in animation on ' + newSlideIndex + ', ' + newSlide);
                this.endNewSlideTransition(newSlide, newSlideIndex);
            }.bind(this);

            this.needIn[newSlideIndex] = true;
            isMakingTransitionIn = true;
            this.update();
        }
        else if (newSlide.camera)
        {
            console.log(newSlide.camera);
            newSlide.target.position1.copy(newSlide.camera.position);
            newSlide.target.lookat1.copy(newSlide.camera.quaternion);
            if (newSlide.duration && newSlide.duration > 0) {
                this.maxTimeCameraTransition = newSlide.duration;
            }

            // TODO manage camera interpolation (position + lookat)
            this.endInAnimationCallback = function() {
                console.log('ending camera animation on ' + newSlideIndex + ', ' + newSlide);
                this.endNewSlideTransition(newSlide, newSlideIndex);
            }.bind(this);

            this.needCam[newSlideIndex] = true;
            isMakingTransitionIn = true;
            this.update();
        }
        else
        {
            this.endNewSlideTransition(newSlide, newSlideIndex);
            isMakingTransitionIn = false;
        }

    }

    return isMakingTransitionIn;
};

Slider.prototype.transitionStart = function(
    oldSlideIndex, newSlideIndex, backwards)
{
    console.log(oldSlideIndex + " -> " + newSlideIndex);

    this.backwards = backwards;

    let isManagingTransitionIn = this.transitionOut(oldSlideIndex, newSlideIndex, backwards);
    if (!isManagingTransitionIn) {
        this.transitionIn(newSlideIndex, backwards);
    }
};

Slider.prototype.update = function() {

    let slides = this.slides;
    let flat = this.flatten(slides);
    this.time += 1;
    this.time %= this.maxTime;

    // Update transitions

    let backwards = this.backwards;
    let numberActiveTransitions = 0;
    let needO = this.needOut;
    let needI = this.needIn;
    let needCam = this.needCam;

    // First update out-transitions
    for (let i = 0; i < needO.length; ++i) {
        if (needO[i] && !backwards) {
            // console.log('out: ' + i);
            let finished = flat[i].animateOut(
                this.time, this.startTime, this.maxTime, this.maxTimeTransition, flat[i].mesh
            );
            if (finished) {
                console.log('end animate out');
                this.endOutAnimationCallback();
            }

            numberActiveTransitions++;
            break;
        }
        // else if (needI[i] && backwards) {
        //     console.log('out: ' + i);
        //     let finished = flat[i].animateIn(this.maxTime - this.time, this.startTime - 1, this.maxTime, flat[i].mesh);
        //     if (finished) {
        //         console.log('end fade out');
        //         this.endInAnimationCallback();
        //     }
        //
        //     numberActiveTransitions++;
        //     break;
        // }
    }
    // Only one animation at a time allowed
    if (numberActiveTransitions > 0)
        return;

    // Then update in-transitions
    for (let i = 0; i < needI.length; ++i) {
        if (needI[i] && !backwards) {
            let finished = flat[i].animateIn(
                this.time, this.startTime, this.maxTime, this.maxTimeTransition, flat[i].mesh
            );
            // console.log('in: ' + i);
            if (finished) {
                console.log('end animate in');
                this.endInAnimationCallback();
            }

            numberActiveTransitions++;
            break;
        }
        // else if (needO[i] && backwards) {
        //     let finished = flat[i].animateOut(this.maxTime - this.time,
        //      this.startTime - 1, this.maxTime, flat[i].mesh);
        //     // console.log('in: ' + i);
        //     if (finished) {
        //         console.log('end fade in');
        //         this.endOutAnimationCallback();
        //     }
        //
        //     numberActiveTransitions++;
        //     break;
        // }
    }
    if (numberActiveTransitions > 0)
        return;

    // Then update cam-transitions
    for (let i = 0; i < needCam.length; ++i) {
        if (needCam[i]) {
            // TODO manage forward and backwards
            let finished = flat[i].transition(
                this.time, this.startTime, this.maxTime, this.maxTimeCameraTransition,
                flat[i].camera, flat[i].target, false // backwards
            );
            if (finished) {
                console.log('end camera movement');
                this.endInAnimationCallback();
            }

            numberActiveTransitions++;
            break;
        }
    }
    if (numberActiveTransitions > 0)
        return;

    // No active transition at this point
    this.transiting = false;

    // Update object animations
    let need = this.needAnimation;
    for (let i = 0; i < need.length; ++i) {
        if (need[i]) {
            // console.log(this.time + ', ' + this.maxTime + ', ' + flat[i].mesh);
            flat[i].animate(this.time, this.maxTime, flat[i].mesh);
        }
    }

};

export default Slider;
