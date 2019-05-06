import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight, DoubleSide, Geometry,
    GridHelper, Line, LineBasicMaterial,
    Mesh,
    MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene, Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import {MeshLine, MeshLineMaterial} from "./lib/MeshLine";

let container, stats;
// let gui;
let camera, scene, renderer;
let mouseHelper;

init();
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
}

function render() {
    renderer.render(scene, camera);
}

function init() {
    // HTML
    container = document.createElement('div');
    document.body.appendChild(container);

    // Renderer
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Stats, GUI
    // gui = new dat.GUI();
    stats = new Stats();
    container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = 0;
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    window.addEventListener('resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Helpers
    // var gridHelper = new PolarGridHelper(30, 10);
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = 0;
    gridHelper.rotation.x = Math.PI/2;
    scene.add(gridHelper);

    // AXES RED GREEN BLUE
    let axesHelper = new AxesHelper(5);
    axesHelper.position.y = -15;
    axesHelper.position.x = 16;
    axesHelper.position.z = 0;
    scene.add(axesHelper);

    // Mouse helper
    let mouseGeometry = new BoxBufferGeometry(1, 1, 1);
    let mouseMaterial = new MeshBasicMaterial({color: 0xff6e2d, opacity: 0.5});
    mouseHelper = new Mesh(mouseGeometry, mouseMaterial);
    // scene.add(mouseHelper);

    let sampling1d = 200;
    let f = sineCurve;
    let redX = 0.5;
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {x: [-15, 15], y: [0, 60 * redY], z: [-15 * redZ, 15 * redZ]};

    add1dCurve(f, sampling1d, extent, scene);

    addLarge1dCurve(f, sampling1d, extent, scene);

    let sampling2d = 128;
    let g = sine2DCurve;
    add2dCurve(g, sampling2d, extent, scene);
}

function add1dCurve(f, sampling, extent, scene) {
    let material = new LineBasicMaterial({
        color: 0x0000ff,
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
    scene.add(line);
}

function addLarge1dCurve(f, sampling, extent, scene) {
    let lineMaterial = new MeshLineMaterial({
        color: 0xff0000,
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
    var mesh = new Mesh(line.geometry, lineMaterial); // this syntax could definitely be improved!
    scene.add(mesh);
    // let line = new Line(geometry, material);
    // scene.add(line);
}

function sineCurve(t) {
    let x = 1.0 * t - 7;
    return Math.sin(x) * Math.cos(x * 0.2) + Math.cos(0.3 * x);
}

function add2dCurve(f, sampling, extent, scene) {
    var geometry = new PlaneBufferGeometry(15, 15, sampling, sampling);

    let xMin = extent.x[0]; let yMin = extent.y[0]; let zMin = extent.z[0];
    let xMax = extent.x[1]; let yMax = extent.y[1]; let zMax = extent.z[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin; let zRan = zMax - zMin;

    let pAttribute = geometry.getAttribute('position');
    for (let i = 0; i <= sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        for (let j = 0; j <= sampling; ++j) {
            let y = yMin + yRan * (j / sampling);
            let z = zRan * f(x, y) / 2;
            let id = i + (sampling + 1) * j;
            pAttribute.setX(id, x);
            pAttribute.setY(id, y);
            pAttribute.setZ(id, z);
        }
    }
    geometry.computeVertexNormals();

    let material = new MeshPhongMaterial( {color: 0x0000ff, side: DoubleSide
    } );
    let plane = new Mesh(geometry, material);
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = 0;
    scene.add(plane);
}

function sine2DCurve(t1, t2) {
    let firstOrderCurve = sineCurve(t1);
    let cx = 0;
    let cy = 15;
    let dx2 = Math.pow(t1 - cx, 2);
    let dy2 = Math.pow(t2 - cy, 2);
    return 1.5 * Math.exp(-(dx2+dy2) / 25.0)
        + firstOrderCurve *
        (Math.exp(-t2 / 20) * Math.cos(0.5 * t2) * Math.cos(0.2 * t2))
        ;
    // z = 0 => 1
}
