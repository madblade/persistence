/**
 * Author: madblade, sept 2019
 */


"use strict";

import {
    ArrowHelper, BufferAttribute,
    Color, DoubleSide,
    Geometry, GridHelper, Group,
    Line,
    LineBasicMaterial,
    Mesh, MeshBasicMaterial,
    MeshPhongMaterial, Plane,
    PlaneBufferGeometry, Quaternion, ShapeBufferGeometry, Sprite, SpriteMaterial, Texture,
    Vector3, VertexColors
} from "three";
import {MeshLine, MeshLineMaterial} from "./MeshLine";

function Plotter()
{
    this.version = 0;
}

Plotter.prototype.makeText = function(
    message, fontGenerator, position, hex, rotation)
{
    let xMid, text;
    let color = new Color(hex);
    // let matDark = new LineBasicMaterial({
    //     color: color,
    //     side: DoubleSide
    // });
    let matLite = new MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: DoubleSide
    });
    let shapes = fontGenerator.generateShapes(message, 100);
    let geometry = new ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    xMid = -0.5 * (geometry.boundingBox.max.x -
        geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);
    // make shape ( N.B. edge view not visible )
    text = new Mesh(geometry, matLite);
    text.position.copy(position);
    text.scale.copy(new Vector3(0.02, 0.02, 0.02));
    text.dontReset = true;

    if (rotation) {
        text.rotation.copy(rotation);
    }

    return text;
};

Plotter.prototype.makeArrowHelper = function(dir, origin)
{
    let length = 30;
    let hex = new Color('#000000');
    let arrowHelper = new ArrowHelper(
        dir, origin, length, hex, 1, 1
    );
    return arrowHelper;
};

Plotter.prototype.make1dCurve = function(f, sampling, extent)
{
    let material = new LineBasicMaterial({
        color: new Color('#4c72e2'),
        linewidth: 1,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round', //ignored by WebGLRenderer
        clippingPlanes: [ new Plane(
            new Vector3(-1, 0, 0),
            15)
        ]
    });

    let geometry = new Geometry();
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let z = zRan * f(x) / 2;
        geometry.vertices.push(
            new Vector3(x, z, 0)
        );
    }

    let line = new Line(geometry, material);
    return line;
};

// What = 'min'
// index = which one
Plotter.prototype.makeSprite1d = function(v, fillStyle, is3D)
{
    let canvasTexture = document.createElement('canvas');
    let size = 256;
    canvasTexture.width = size;
    canvasTexture.height = size;
    let context = canvasTexture.getContext('2d');

    context.beginPath();
    context.fillStyle = fillStyle;
    context.arc(
        size / 2, size / 2,
        size / 2,
        0, 2 * Math.PI,
        true
    );
    context.fill();
    context.stroke();

    let threeTexture = new Texture(canvasTexture);
    threeTexture.needsUpdate = true;

    let material = new SpriteMaterial({
        map: threeTexture,
        color: 0xffffff,
        // depthWrite: false
    });
    let sprite = new Sprite(material);
    if (is3D) {
        sprite.position.x = v[0];
        sprite.position.z = v[1];
        sprite.position.y = v[2];
        sprite.scale.set(0.5, 0.5, 0.5);
    } else {
        sprite.position.x = v[0];
        sprite.position.y = v[1];
        sprite.position.z = -0.05;
        sprite.scale.set(1, 1, 1);
    }
    return sprite;
};

Plotter.prototype.findGlobalMin1d = function(
    f, sampling, extent)
{
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;
    let globalMin = [0, Number.POSITIVE_INFINITY];
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let z = zRan * f(x) / 2;
        if (z < globalMin[1]) {
            globalMin = [x, z];
        }
    }
    return globalMin;
};

Plotter.prototype.findLocalMinima = function(
    f, sampling, extent)
{
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;

    let localMins = [];
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let xm = xMin + xRan * ((i-1) / sampling);
        let xp = xMin + xRan * ((i+1) / sampling);
        let z = zRan * f(x) / 2;
        let zm = i < 1 ? z + 1 : zRan * f(xm) / 2;
        let zp = i > sampling - 2 ? z + 1 : zRan * f(xp) / 2;
        if (z < zm && z < zp) {
            localMins.push([x, z]);
        }
    }

    return localMins;
};

Plotter.prototype.findLocalMaxima = function(
    f, sampling, extent)
{
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;

    let localMaxs = [];
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let xm = xMin + xRan * ((i-1) / sampling);
        let xp = xMin + xRan * ((i+1) / sampling);
        let z = zRan * f(x) / 2;
        let zm = i < 1 ? z - 1 : zRan * f(xm) / 2;
        let zp = i > sampling - 2 ? z - 1 : zRan * f(xp) / 2;
        if (z > zm && z > zp) {
            localMaxs.push([x, z]);
        }
    }

    return localMaxs;
};

Plotter.prototype.makeLarge1dCurve = function(
    f, sampling, extent, colorIndex, clippingPlanes)
{
    if (!colorIndex) colorIndex = 0;

    let colors = [
        new Color('#ff6452'),
        new Color('#ffa765'),
        new Color('#68cfff'),
        new Color('#b75bff'),
        new Color('#539d60'),
        new Color('#fff34c')
    ];

    let materialClippingPlanes = [
        new Plane(new Vector3(0, -1, 0),30)
    ];
    if (clippingPlanes && clippingPlanes.length > 0)
    {
        // console.log('I added a clipping plane');
        materialClippingPlanes.push(...clippingPlanes);
    }

    let lineMaterial = new MeshLineMaterial({
        color: colors[colorIndex],
        lineWidth: 0.5,
        clipping: true,
        clippingPlanes: materialClippingPlanes
    });

    let geometry = new Geometry();
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let z = zRan * f(x) / 2;
        geometry.vertices.push(
            new Vector3(x, z, -0.05)
        );
    }

    let line = new MeshLine();
    line.setGeometry(geometry);
    return new Mesh(line.geometry, lineMaterial);
};

Plotter.prototype.makeLargeSegment = function(p1, p2)
{
    let lineMaterial = new MeshLineMaterial({
        color: new Color('#ff6452'),
        lineWidth: 0.2,
    });
    let geometry = new Geometry();
    geometry.vertices.push(new Vector3(p1[0], p1[2], p1[1]));
    geometry.vertices.push(new Vector3(p2[0], p2[2], p2[1]));
    let line = new MeshLine();
    line.setGeometry(geometry);
    return new Mesh(line.geometry, lineMaterial);
};

Plotter.prototype.make2dCurveWireframeColor = function(
    f, sampling, extent, coordX, coordY)
{
    let widthSegments = 10;
    let heightSegments = 10;
    let halfSubSampling = 5;
    let subSampling = 2 * halfSubSampling;
    let width = 15 * widthSegments / sampling;
    let height = 15 * heightSegments / sampling;
    let geometry = new PlaneBufferGeometry(
        width, height, widthSegments, heightSegments);

    let xMin = extent.x[0]; let yMin = extent.y[0];
    let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1];
    let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin;
    let zRan = zMax - zMin;

    let pAttribute = geometry.getAttribute('position');
    let cols = [];
    let nbSup = 0;
    let nbInf = 0;

    // coordX and coordY are inverted
    let xCenter = xMin + xRan * (coordX / sampling);
    let yCenter = yMin + yRan * (coordY / sampling);
    let threshold = zRan * f(xCenter, yCenter, 0) / 2;

    for (let j = 0; j <= sampling; ++j) {
        let y = yMin + yRan * (j / sampling);
        if (Math.abs(j - coordY) > 5) continue;

        for (let i = 0; i <= sampling; ++i) {
            let x = xMin + xRan * (i / sampling);
            if (Math.abs(i - coordX) > 5) continue;

            let z = zRan * f(x, y, 0) / 2;
            // let id = i + (sampling + 1) * j;
            let id = (i - coordX + subSampling/2) +
                (subSampling + 1) * (j - coordY + subSampling/2);
            pAttribute.setX(id, x);
            pAttribute.setY(id, y);
            pAttribute.setZ(id, z);

            if (z < threshold) {
                ++nbInf;
                cols.push(0.0, 0.5, 0.9);
            } else if (z > threshold) {
                cols.push(0.9, 0.5, 0.0);
                ++nbSup;
            } else {
                cols.push(0.9, 0.5, 0.9);
            }
        }
    }

    let colors = new Float32Array(cols);
    // console.log(nbInf);
    // console.log(nbSup);
    geometry.addAttribute('color',
        new BufferAttribute(colors, 3)
    );

    geometry.computeVertexNormals();

    let material = new MeshPhongMaterial({
        vertexColors: VertexColors,
        side: DoubleSide,
        wireframe: true
    });

    let plane = new Mesh(geometry, material);
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = 0;

    return plane;
};

Plotter.prototype.make2dCurve = function(
    f, sampling, extent)
{
    let geometry = new PlaneBufferGeometry(
        15, 15, sampling, sampling);

    let xMin = extent.x[0]; let yMin = extent.y[0];
    let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1];
    let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin;
    let zRan = zMax - zMin;

    let pAttribute = geometry.getAttribute('position');
    for (let i = 0; i <= sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        for (let j = 0; j <= sampling; ++j) {
            let y = yMin + yRan * (j / sampling);
            let z = zRan * f(x, y, 0) / 2;
            let id = i + (sampling + 1) * j;
            pAttribute.setX(id, x);
            pAttribute.setY(id, y);
            pAttribute.setZ(id, z);
        }
    }
    geometry.computeVertexNormals();

    let material = new MeshPhongMaterial({
        color: new Color('#3b49a6'),
        side: DoubleSide,
        shininess: 100
    });

    let plane = new Mesh(geometry, material);
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = 0;

    return plane;
};

// HARD CODED BELOW

Plotter.prototype.generatorCurve1d = function(t)
{
    let x = 1.0 * t - 7;
    return Math.sin(x) * Math.cos(x * 0.2) + Math.cos(0.3 * x);
};

Plotter.prototype.evaluateFromExpressionAndExtent2d = function(
    expression, extent, samplingX, samplingY)
{
    let xMin = extent.x[0];
    let xMax = extent.x[1];
    let xRan = xMax - xMin;
    let yMin = extent.y[0];
    let yMax = extent.y[1];
    let yRan = yMax - yMin;
    let zMin = extent.z[0];
    let zMax = extent.z[1];
    let zRan = zMax - zMin;

    return function(i, j) {
        let f = expression;
        let x = xMin + xRan * (i / samplingX);
        let y = yMin + yRan * (j / samplingY);
        return zRan * f(x, y, 0) / 2;
    };
};


Plotter.prototype.evaluatePointFromExpressionAndExtent2d = function(
    expression, extent, samplingX, samplingY)
{
    let xMin = extent.x[0];
    let xMax = extent.x[1];
    let xRan = xMax - xMin;
    let yMin = extent.y[0];
    let yMax = extent.y[1];
    let yRan = yMax - yMin;
    let zMin = extent.z[0];
    let zMax = extent.z[1];
    let zRan = zMax - zMin;

    return function(i, j) {
        let f = expression;
        let x = xMin + xRan * (i / samplingX);
        let y = yMin + yRan * (j / samplingY);
        let z = zRan * f(x, y, 0) / 2;
        return [x, -y, z];
    };
};

Plotter.prototype.generatorCurve2d = function(t1, t2, t3)
{
    let firstOrderCurve = this.generatorCurve1d(t1);
    let cx = 0;
    let cy = 15;
    let dx2 = Math.pow(t1 - cx, 2);
    let dy2 = Math.pow(t2 - cy, 2);
    return 1.5 * Math.exp(-(dx2+dy2) / 25.0)
        + firstOrderCurve *
            (Math.exp(-t2 / 20) *
            Math.cos(0.5 * t2 * (1.0)) *
            Math.cos(0.2 * t2 + t3))
        ;
};

Plotter.prototype.updateCurve2dt = function(
    surface2D, time, maxTime, f, sampling)
{
    let pt = time / maxTime;
    let geometry = surface2D.geometry;
    let pAttribute = geometry.getAttribute('position');
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {
        x: [-15, 15],
        y: [0, 60 * redY],
        z: [-15 * redZ, 15 * redZ]
    };

    let xMin = extent.x[0]; let yMin = extent.y[0];
    let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1];
    let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin;
    let zRan = zMax - zMin;

    for (let i = 0; i <= sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        for (let j = 0; j <= sampling; ++j) {
            let y = yMin + yRan * (j / sampling);
            let z = zRan * f(x, y, 2.0 * Math.PI * pt) / 2;
            let id = i + (sampling + 1) * j;
            pAttribute.setX(id, x);
            pAttribute.setY(id, y);
            pAttribute.setZ(id, z);
        }
    }
    pAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
};

Plotter.prototype.makeAxisHelperXY = function()
{
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = 0;
    gridHelper.rotation.x = Math.PI/2;
    return gridHelper;
};

Plotter.prototype.makeAxisHelperXZ = function()
{
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = -15;
    gridHelper.position.z = -15;
    return gridHelper;
};

Plotter.prototype.makeAxisHelperX = function()
{
    let dir = new Vector3(1, 0, 0);
    dir.normalize();
    let origin = new Vector3(-15, -16, 0);
    return this.makeArrowHelper(dir, origin)
};

Plotter.prototype.makeAxisHelperY = function()
{
    let dir = new Vector3(0, 1, 0);
    dir.normalize();
    let origin = new Vector3(-16, -15, 0);
    return this.makeArrowHelper(dir, origin)
};

Plotter.prototype.makeAxisHelperZ = function()
{
    let dir = new Vector3(0, 0, -1);
    dir.normalize();
    let origin = new Vector3(-16, -16, 0);
    return this.makeArrowHelper(dir, origin)
};

Plotter.prototype.makeGroup = function()
{
    return new Group();
};


//
// Linear transitions
//

Plotter.prototype.getNumberOfTicks = function(
    time, startTime, maxTime)
{
    return (time > startTime) ?
        (time - startTime) :
        (time + maxTime - startTime);
};

Plotter.prototype.updatePlane = function(
    mesh, extent, axis, progress)
{
    let cp = mesh.material.clippingPlanes;
    if (!cp || !cp[0]) return true;

    let plane = cp[0];
    let start = extent[axis][0];
    let end = extent[axis][1];
    plane.constant = start + progress * (end - start); // lerp
    plane.needsUpdate = true;
};

Plotter.prototype.swipeIn = function(
    axis, mesh,
    time, startTime, maxTime, maxTimeTransition,
    extent)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    if (mesh.isGroup) {
        // Supported: 1-level traversal
        let children = mesh.children;
        for (let i = 0; i < children.length; ++i) {
            this.updatePlane(children[i], extent, axis, progress);
        }
    } else {
        this.updatePlane(mesh, extent, axis, progress);
    }

    return nbTicks === maxTimeTransition;
};

Plotter.prototype.swipeOut = function(
    axis, mesh,
    time, startTime, maxTime, maxTimeTransition,
    extent)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    let progress = 1 - (nbTicks / maxTimeTransition);

    if (mesh.isGroup) {
        // Supported: 1-level traversal
        let children = mesh.children;
        for (let i = 0; i < children.length; ++i) {
            this.updatePlane(children[i], extent, axis, progress);
        }
    } else {
        this.updatePlane(mesh, extent, axis, progress);
    }

    return nbTicks === maxTimeTransition;
};

Plotter.prototype.stretchIn = function(
    axis, mesh,
    time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    mesh.scale[axis] = Math.max(progress, 0.001);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.stretchOut = function(
    axis, mesh,
    time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    mesh.scale[axis] = Math.max(1 - progress, 0.001);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.setOpacity = function(mesh, opacity)
{
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
                m.opacity = opacity;
                m.needsUpdate = true;
            }
        }
    }

    if (material) {
        material.transparent = true;
        material.opacity = opacity;
        material.needsUpdate = true;
    }
};

// Returns false if animation in progress
// Return true if animation finished
Plotter.prototype.fadeIn = function(
    mesh,
    time, startTime, maxTime, maxTimeTransition,
    opacityMax)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;
    // console.log(nbTicks + ' ( ' + time + ', ' + startTime + ' )');

    if (opacityMax !== undefined) progress *= opacityMax;
    this.setOpacity(mesh, progress);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.fadeOut = function(
    mesh,
    time, startTime, maxTime, maxTimeTransition,
    opacityMax)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    if (opacityMax !== undefined) progress *= opacityMax;
    this.setOpacity(mesh, 1 - progress);
    return nbTicks === maxTimeTransition;
};

//
// Non-linear transitions
//
Plotter.prototype.linear = function(progress)
{
    return progress;
};

Plotter.prototype.smoothstep = function(progress)
{
    return progress < 0 ? 0 : progress > 1 ? 1 :
        3 * Math.pow(progress, 2) -
        2 * Math.pow(progress, 3);
};

Plotter.prototype.perlinstep = function(progress)
{
    return progress < 0 ? 0 : progress > 1 ? 1 :
        6 * Math.pow(progress, 5) -
        15 * Math.pow(progress, 4) +
        10 * Math.pow(progress, 3);
};

Plotter.prototype.interpolateCamera = function(
    camera, target,
    time, startTime, maxTime, maxTimeTransition,
    interpolant,
    backwards)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = interpolant(nbTicks / maxTimeTransition);

    let initialPosition = backwards ?
        target.position2 : target.position1;
    let targetPosition  = backwards ?
        target.position1 : target.position2;
    let cameraPosition = camera.position;

    let dx = initialPosition.x +
        progress * (targetPosition.x - initialPosition.x);
    let dy = initialPosition.y +
        progress * (targetPosition.y - initialPosition.y);
    let dz = initialPosition.z +
        progress * (targetPosition.z - initialPosition.z);

    cameraPosition.x = dx;
    cameraPosition.y = dy;
    cameraPosition.z = dz;

    let initialQuaternion = backwards ?
        target.quaternion2 : target.quaternion1;
    let targetQuaternion =  backwards ?
        target.quaternion1 : target.quaternion2;
    let cameraQuaternion = camera.quaternion;
    let result = new Quaternion();
    Quaternion.slerp(
        initialQuaternion, targetQuaternion, result, progress
    );
    cameraQuaternion.copy(result);

    return nbTicks === maxTimeTransition;
};

export default Plotter;
