"use strict";

import {
    ArrowHelper,
    Color, DoubleSide,
    Geometry, GridHelper,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshPhongMaterial,
    PlaneBufferGeometry,
    Vector3
} from "three";
import {MeshLine, MeshLineMaterial} from "./MeshLine";

function Plotter()
{
    this.version = 0;
}

Plotter.prototype.makeArrowHelper = function(dir, origin)
{
    let length = 30;
    let hex = new Color('#000000');
    let arrowHelper = new ArrowHelper(dir, origin, length, hex, 1, 1);
    return arrowHelper;
};

Plotter.prototype.make1dCurve = function(f, sampling, extent) {
    let material = new LineBasicMaterial({
        color: new Color('#4c72e2'),
        linewidth: 1,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round' //ignored by WebGLRenderer
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

Plotter.prototype.makeLarge1dCurve = function(f, sampling, extent)
{
    let lineMaterial = new MeshLineMaterial({
        color: new Color('#ffa765'),
        lineWidth: 0.5,
    });

    let geometry = new Geometry();
    let xMin = extent.x[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let zRan = zMax - zMin;
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let z = zRan * f(x) / 2;
        geometry.vertices.push(
            new Vector3(x, z, -0.01)
        );
    }

    let line = new MeshLine();
    line.setGeometry(geometry);
    var mesh = new Mesh(line.geometry, lineMaterial);
    return mesh;
};

Plotter.prototype.make2dCurve = function(f, sampling, extent) {
    let geometry = new PlaneBufferGeometry(15, 15, sampling, sampling);

    let xMin = extent.x[0]; let yMin = extent.y[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin; let zRan = zMax - zMin;

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
        color: new Color('#4c72e2'),
        side: DoubleSide
    });
    var plane = new Mesh(geometry, material);
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = 0;

    return plane;
};

// HARD CODED BELOW

Plotter.prototype.generatorCurve1d = function(t) {
    let x = 1.0 * t - 7;
    return Math.sin(x) * Math.cos(x * 0.2) + Math.cos(0.3 * x);
};

Plotter.prototype.generatorCurve2d = function(t1, t2, t3) {
    let firstOrderCurve = this.generatorCurve1d(t1);
    let cx = 0;
    let cy = 15;
    let dx2 = Math.pow(t1 - cx, 2);
    let dy2 = Math.pow(t2 - cy, 2);
    return 1.5 * Math.exp(-(dx2+dy2) / 25.0)
        + firstOrderCurve *
        (Math.exp(-t2 / 20) * Math.cos(0.5 * t2 * (1.0)) * Math.cos(0.2 * t2 + t3))
        ;
};

Plotter.prototype.updateCurve2dt = function(surface2D, time, maxTime, f, sampling) {
    let pt = time / maxTime;
    let geometry = surface2D.geometry;
    let pAttribute = geometry.getAttribute('position');
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {x: [-15, 15], y: [0, 60 * redY], z: [-15 * redZ, 15 * redZ]};
    let xMin = extent.x[0]; let yMin = extent.y[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin; let zRan = zMax - zMin;
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

Plotter.prototype.makeAxisHelperXY = function() {
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = 0;
    gridHelper.rotation.x = Math.PI/2;
    return gridHelper;
};

Plotter.prototype.makeAxisHelperXZ = function() {
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = -15;
    gridHelper.position.z = -15;
    return gridHelper;
};

Plotter.prototype.makeAxisHelperX = function() {
    let dir = new Vector3(1, 0, 0);
    dir.normalize();
    let origin = new Vector3(-15, -16, 0);
    return this.makeArrowHelper(dir, origin)
};

Plotter.prototype.makeAxisHelperY = function() {
    let dir = new Vector3(0, 1, 0);
    dir.normalize();
    let origin = new Vector3(-16, -15, 0);
    return this.makeArrowHelper(dir, origin)
};

Plotter.prototype.makeAxisHelperZ = function() {
    let dir = new Vector3(0, 0, -1);
    dir.normalize();
    let origin = new Vector3(-16, -16, 0);
    return this.makeArrowHelper(dir, origin)
};

//
// Transitions
//

Plotter.prototype.getNumberOfTicks = function(time, startTime, maxTime)
{
    return (time > startTime) ?
        (time - startTime) :
        (time + maxTime - startTime);
};

Plotter.prototype.stretchIn = function(axis, mesh, time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    // console.log(nbTicks + ' ( ' + time + ', ' + startTime + ' )');
    let progress = nbTicks / maxTimeTransition;

    mesh.scale[axis] = Math.max(progress, 0.001);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.stretchOut = function(axis, mesh, time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks =  this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    mesh.scale[axis] = Math.max(1 - progress, 0.001);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.setOpacity = function(mesh, opacity) {
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
    mesh, time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;
    // console.log(nbTicks + ' ( ' + time + ', ' + startTime + ' )');

    this.setOpacity(mesh, progress);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.fadeOut = function(
    mesh, time, startTime, maxTime, maxTimeTransition)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    this.setOpacity(mesh, 1 - progress);
    return nbTicks === maxTimeTransition;
};

Plotter.prototype.linearCamera = function(
    camera, target, time, startTime, maxTime, maxTimeTransition, backwards)
{
    let nbTicks = this.getNumberOfTicks(time, startTime, maxTime);
    let progress = nbTicks / maxTimeTransition;

    let initialPosition = backwards ? target.position2 : target.position1;
    let targetPosition  = backwards ? target.position1 : target.position2;

    let initialFocus = backwards ? target.lookat2 : target.lookat1;
    let targetFocus = backwards ? target.lookat1 : target.lookat2;

    let cameraPosition = camera.position;

    let dx = initialPosition.x + progress * (targetPosition.x - initialPosition.x);
    let dy = initialPosition.y + progress * (targetPosition.y - initialPosition.y);
    let dz = initialPosition.z + progress * (targetPosition.z - initialPosition.z);

    cameraPosition.x = dx;
    cameraPosition.y = dy;
    cameraPosition.z = dz;

    let cameraQuaternion = camera.quaternion;
    console.log(cameraQuaternion);
    cameraQuaternion.slerp(targetFocus, progress);

    return nbTicks === maxTimeTransition;
};

export default Plotter;
