import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import Plotter from './lib/Plot';
import Slider from "./lib/Slider";

let container, stats;
// let gui;
let camera, scene, renderer;
let mouseHelper;
let slider;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
}

var plotter;
var surface2D;
var ttt = 0;
var requireAnimateSurface2D = false;
function render() {
    ttt += 1;
    ttt %= 100;
    if (ttt >= 0 && surface2D !== null && requireAnimateSurface2D) {
        plotter.updateCurve2dt(surface2D, ttt, 100, plotter.generatorCurve2d.bind(plotter));
    }
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
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Stats, GUI
    // gui = new dat.GUI();
    stats = new Stats();
    container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 50;
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

    slider = new Slider(scene);
    window.addEventListener('keydown', slider.onKeyDown.bind(slider), false);
    plotter = new Plotter();

    // Helpers
    let xyHelper = plotter.makeAxisHelperXY();
    let xzHelper = plotter.makeAxisHelperXZ();
    let xHelper = plotter.makeAxisHelperX();
    let yHelper = plotter.makeAxisHelperY();
    let zHelper = plotter.makeAxisHelperZ();
    slider.addSlide({
        mesh: xHelper,
    });
    slider.addSlide({
        mesh: yHelper,
    });
    slider.addSlide({
        mesh: zHelper,
    });
    slider.addSlide(
        [{
            mesh: xyHelper,
        },
        {
            mesh: xzHelper,
        }]
    );

    // for (let i = 0; i < 16; ++i)
    // {
    //     console.log(slider.computeBounds(
    //         [[[
    //             1, 2, [0, 1, 2], [2, 1, [3, 4, 5, 6], 3, 4, 5], 4, 5
    //         ]]],
    //         i));
    // }

    // slider.addSlide({
    //     clear: true
    // });

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
    let redX = 0.5;
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {x: [-15, 15], y: [0, 60 * redY], z: [-15 * redZ, 15 * redZ]};

    let curve1d = plotter.make1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    slider.addSlide({
        mesh: curve1d
    });

    let largeCurve1d = plotter.makeLarge1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    slider.addSlide({
        mesh: largeCurve1d
    });

    let sampling2d = 128;
    let curve2d = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    slider.addSlide({
        mesh: curve2d
    });

    let curve2dt = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    surface2D = curve2dt;
    slider.addSlide({
        mesh: curve2dt,
        request: function(v) {requireAnimateSurface2D = v;}.bind(this)
    });

    // for (let i = 0; i < 9; ++i)
    // {
    //     console.log(slider.computeBounds(slider.slides, i));
    // }
}

init();
animate();
