import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    Color,
    DirectionalLight, Euler,
    Font,
    Group,
    PerspectiveCamera, Plane, Quaternion,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import Plotter from './lib/Plot';
import Slider from "./lib/Slider";
import Helvetiker from './lib/helvetiker.js';

let container, stats;
// let gui;
let camera, scene, renderer;
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
function render() {
    slider.update();
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
    // container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(
        45, window.innerWidth / window.innerHeight,
        1, 2000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    let controls = new OrbitControls(camera, renderer.domElement);
    // controls.enablePan = false;
    controls.target.copy(new Vector3(0, 0, -15));
    window.addEventListener(
        'resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // AXES RED GREEN BLUE
    let axesHelper = new AxesHelper(5);
    axesHelper.position.y = -15;
    axesHelper.position.x = 16;
    axesHelper.position.z = 0;
    // scene.add(axesHelper);

    // Slides
    slider = new Slider(scene, camera, controls);
    window.addEventListener(
        'keydown', slider.onKeyDown.bind(slider), false
    );
    document
        .getElementById('rightbutton')
        .addEventListener('click',
        () => slider.onKeyDown({keyCode: 39}), false);
    document
        .getElementById('leftbutton')
        .addEventListener('click',
        () => slider.onKeyDown({keyCode: 37}), false);

    let explainerElement = document.getElementById('explainer-text');

    plotter = new Plotter();

    // Transitions
    let stretchIn = function(t, s, m, mx, mesh)
    {
        return plotter.stretchIn('y', mesh, t, s, m, mx);
    };
    let stretchOut = function(t, s, m, mx, mesh)
    {
        return plotter.stretchOut('y', mesh, t, s, m, mx);
        // return true; //
    };
    let fadeIn = function(t, s, m, mx, mesh, opacityMax)
    {
        return plotter.fadeIn(mesh, t, s, m, mx, opacityMax);
    };
    let fadeOut = function(t, s, m, mx, mesh)
    {
        return plotter.fadeOut(mesh, t, s, m, mx);
    };
    let linearCamera = function(
        t, s, m, mx, camera, target, backwards)
    {
        return plotter.interpolateCamera(
            camera, target, t, s, m, mx, plotter.linear,
            backwards);
    };
    let smoothCamera = function(
        t, s, m, mx, camera, target, backwards)
    {
        return plotter.interpolateCamera(
            camera, target, t, s, m, mx, plotter.smoothstep,
            backwards);
    };
    let smootherCamera = function(
        t, s, m, mx, camera, target, backwards)
    {
        return plotter.interpolateCamera(
            camera, target, t, s, m, mx, plotter.perlinstep,
            backwards);
    };

    let sampling1d = 200;
    let redX = 0.5;
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {
        x: [-15, 15],
        y: [0, 60 * redY],
        z: [-15 * redZ, 15 * redZ]
    };

    let swipeInBack =  function(t, s, m, mx, mesh) {
        return plotter.swipeIn(
            'z', mesh, t, s, m, mx, {z: [0, 30]}
            );
    };

    let swipeInRight = function(t, s, m, mx, mesh) {
        return plotter.swipeIn(
            'x', mesh, t, s, m, mx, extent
        );
    };

    let swipeInUp = function(extent) {
        return function(t, s, m, mx, mesh) {
            return plotter.swipeIn(
                'y', mesh, t, s, m, mx, extent
            );
        };
    };
    let swipeOutUp = function(extent) {
        return function(t, s, m, mx, mesh) {
            return plotter.swipeOut(
                'y', mesh, t, s, m, mx, extent
            );
        }
    };

    let xyHelper = plotter.makeAxisHelperXY();
    let xHelper = plotter.makeAxisHelperX();
    let yHelper = plotter.makeAxisHelperY();
    let zHelper = plotter.makeAxisHelperZ();

    let minimum1d1 = plotter.findGlobalMin1d(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    let spriteMinimum1 = plotter.makeSprite1d(minimum1d1, "#ff0000");

    let minimad1 = plotter.findLocalMinima(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    minimad1.sort(function (a, b) {
        return a[1] - b[1];
    });
    let smin1 = plotter.makeSprite1d(minimad1[0], "#ff0000");
    let smin2 = plotter.makeSprite1d(minimad1[1], "#ff0000");
    let smin3 = plotter.makeSprite1d(minimad1[2], "#ff0000");
    let smin4 = plotter.makeSprite1d(minimad1[3], "#ff0000");
    let smin5 = plotter.makeSprite1d(minimad1[4], "#ff0000");
    let smin6 = plotter.makeSprite1d(minimad1[5], "#ff0000");

    let maximad1 = plotter.findLocalMaxima(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    maximad1.sort(function (a, b) {
        return a[1] - b[1];
    });
    let smax1 = plotter.makeSprite1d(maximad1[0], "#0000ff");
    let smax2 = plotter.makeSprite1d(maximad1[1], "#0000ff");
    let smax3 = plotter.makeSprite1d(maximad1[2], "#0000ff");
    let smax4 = plotter.makeSprite1d(maximad1[3], "#0000ff");
    let smax5 = plotter.makeSprite1d(maximad1[4], "#0000ff");


    let curve1d = plotter.make1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    let largeCurve1d = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );

    // Right join
    let largeCurve1d2 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -13.2), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let largeCurve1d3 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 4,
        [
            new Plane(new Vector3(-1, 0, 0), 13.2), // right cut
            new Plane(new Vector3(1, 0, 0), -11.3), // left cut
        ]
    );

    // Middle join
    let largeCurve1d4 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), -0.3), // right cut
            new Plane(new Vector3(1, 0, 0), 5.70), // left cut
        ]
    );
    let largeCurve1d5 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 0.52), // right cut
            new Plane(new Vector3(1, 0, 0), 5.95), // left cut
        ]
    );
    let largeCurve1d6 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 3,
        [
            new Plane(new Vector3(-1, 0, 0), -9.38), // right cut
            new Plane(new Vector3(1, 0, 0), 10.48), // left cut
        ]
    );

    let lookAt1 = new Quaternion();
    let upv1 = new Vector3(0, 1, 0);
    lookAt1.setFromAxisAngle(upv1.normalize(), 0);

    let lookAt2 = new Quaternion();
    let upv2 = new Vector3(0, 1, 0);
    lookAt2.setFromAxisAngle(upv2.normalize(), Math.PI/2);

    let lookAt3 = new Quaternion();
    let upv3 = new Vector3(1, 0, 0);
    lookAt3.setFromAxisAngle(upv3.normalize(), -Math.PI/8);

    lookAt2.multiply(lookAt3);

    let domainText = plotter.makeText(
        'domain', fontGenerator,
        new Vector3(10, -19, 0), '#006699'
    );
    let rangeText = plotter.makeText(
        'range', fontGenerator,
        new Vector3(-20, 15, 0), '#006699'
    );
    let dataText = plotter.makeText(
        'data', fontGenerator,
        new Vector3(20, 0, -4), '#0011aa'
    );

    slider.addSlides([
        {
            mesh: xyHelper,
            animateIn: fadeIn,
            opacityMax: 0.5,
            explainText: '1-dimensional persistent homology on an example',
        },
        // {
        //     mesh: largeCurve1d2,
        //     animateIn: swipeInUp({y: [-15, 15]}),
        //     explainText: '',
        // },
        // {
        //     mesh: largeCurve1d3,
        //     animateIn: swipeInUp({y: [-15, 15]}),
        //     explainText: '',
        // },
        // TODO [HIGH]: group meshes for simultaneous entry

        {
            mesh: largeCurve1d6,
            animateIn: swipeInUp({y: [-15, 15]}),
            explainText: '',
        },

        {   mesh: smin2, removeAfter:  [largeCurve1d2, largeCurve1d3],
            explainText: '',   },

        {
            camera: camera,
            target: {
                position1: new Vector3(), // Unimportant
                position2: new Vector3(0, 0, 100),
                quaternion1: new Quaternion(), // Unimportant
                quaternion2: lookAt1
            },
            transition: smootherCamera,
            duration: 50,
            explainText: 'Let us consider a 1-dimensional domain',
        },
        {
            mesh: xHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut,
            explainText: 'The domain is represented by the x-axis',
        },
        {
            mesh: domainText,
            explainText: 'The domain is represented by the x-axis',
        },
        {
            mesh: yHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut,
            explainText: 'A 1-dimensional range is represented on the y-axis',
        },
        {
            mesh: rangeText,
            explainText: '(Explanations to be continued)',
        },
        // {
        //     camera: camera,
        //     target: {
        //         position1: new Vector3(0, 0, 0), // Unimportant
        //         position2: new Vector3(0, 0, 40),
        //         quaternion1: new Quaternion(), // Unimportant
        //         quaternion2: lookAt2
        //     },
        //     transition: smoothCamera,
        //     duration: 50,
        // },
        {
            mesh: curve1d,
            animateIn: swipeInRight,
            duration: 45,
            explainText: '',
        },
        {
            mesh: dataText,
            explainText: '',
        },

        {   mesh: smin1,
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-15, -5]}),
            duration: 90,
            explainText: '',
        },

        {   mesh: smin2, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d2,
            animateIn: swipeInUp({y: [-5, -4]}),
            duration: 20,
            explainText: '',
        },

        {   mesh: smin3, removeAfter:  [largeCurve1d2],
            explainText: '',    },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-4, -3.2]}),
            duration: 20,
            explainText: '',
        },
        {   mesh: smin4, removeAfter:  [largeCurve1d],
            explainText: '',  },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-3.2, -2.3]}),
            duration: 20,
            explainText: '',
        },

        {   mesh: smax1, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-2.3, 0]}),
            duration: 20,
            explainText: '',
        },
        {   mesh: smin5, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [0, 4.2]}),
            duration: 20,
            explainText: '',
        },
        {   mesh: smax2, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [4.2, 6.8]}),
            duration: 20,
            explainText: '',
        },
        {   mesh: smax3, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [6.8, 12]}),
            duration: 20,
            explainText: '',
        },
        {   mesh: smin6,
            explainText: '',   },
        {   mesh: smax4,
            explainText: '',   },
        {   mesh: smax5, removeAfter:  [largeCurve1d],
            explainText: '',   },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [12, 15]}),
            duration: 50,
            removeAfter: [
                xyHelper, xHelper, rangeText, domainText, dataText,
                curve1d, largeCurve1d,
                smin1, smin2, smin3, smin4, smin5, smin6,
                smax1, smax2, smax3, smax4, smax5
            ],
            explainText: '',
        }
        // {
        //     mesh: largeCurve1d,
        //     animateIn: swipeInUp({y: [-15, 15]}),
        //     // animateOut: swipeOutUp({y: [-15, 15]}),
        //     duration: 90
        // }
    ], explainerElement);

    let group = new Group();
    let xyHelper2 = plotter.makeAxisHelperXY();
    let curve1d2 = plotter.make1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    plotter.setOpacity(xyHelper2, 0.5);
    group.add(xyHelper2);
    group.add(curve1d2);

    let xzHelper = plotter.makeAxisHelperXZ();
    xzHelper.material.clippingPlanes = [
        new Plane(new Vector3(0, 0, 1), 15)
    ];

    let sampling2d = 128;
    let curve2d = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );
    curve2d.material.clippingPlanes = [
        new Plane(new Vector3(0, 0, 1), 15)
    ];
    let curve2d2 = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );
    curve2d2.material.clippingPlanes = [
        new Plane(new Vector3(0, -1, 0), 15)
    ];
    let curve2dt = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );

    let domain2Text = plotter.makeText(
        'domain', fontGenerator,
        new Vector3(8, -15, -31), '#006600',
        new Euler(-Math.PI / 2, 0, 0, 'XYZ') // rotation
    );
    let range2Text = plotter.makeText(
        'range', fontGenerator,
        new Vector3(-16, 15, 4), '#006600',
        new Euler(0, Math.PI / 2, 0, 'XYZ') // rotation
    );
    let groupText = new Group();
    groupText.add(domain2Text);
    groupText.add(range2Text);

    let curve2dTransparent = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );

    slider.addSlides([
        {
            mesh: curve1d2
        },
        {
            camera: camera,
            target: {
                position1: new Vector3(), // reset by slider
                position2: new Vector3(50, 20, -15),
                quaternion1: new Quaternion(), // reset by slider
                quaternion2: lookAt2
            },
            transition: smootherCamera,
            duration: 50,
        },
        // {
        //     mesh: zHelper,
        //     animateIn: stretchIn,
        //     // animateOut: stretchOut
        // },
        {
            mesh: xzHelper,
            animateIn: swipeInBack,
            opacityMax: 0.5, // TODO fix that
            // removeAfter: [zHelper]
        },
        {
            mesh: groupText
        },
        {
            mesh: curve2d,
            animateIn: swipeInBack, // left-to-right camera
            duration: 50,
            removeAfter: [curve2d, curve1d2]
        },
        {
            mesh: curve2dTransparent,
            opacityMax: 0.1
        },
        {
            mesh: curve2d2,
            animateIn: swipeInUp({y: [-15, 0]}),
            duration: 90,
            removeAfter: [curve2d2]
        },
        {
            mesh: curve2d2,
            animateIn: swipeInUp({y: [0, 5]}),
            duration: 90,
            removeAfter: [curve2d2]
        },
        {
            mesh: curve2d2,
            animateIn: swipeInUp({y: [5, 15]}),
            duration: 90,
            removeAfter: [curve2d2, curve2dTransparent]
        },
        {
            mesh: curve2dt,
            animate: function(time, maxTime, mesh) {
                plotter.updateCurve2dt(
                    mesh, time, maxTime,
                    plotter.generatorCurve2d.bind(plotter),
                    sampling2d
                );
            }
        }
    ]);

    // for (let i = 0; i < 9; ++i)
    // {
    //     console.log(slider.computeBounds(slider.slides, i));
    // }

    // for (let i = 0; i < 16; ++i)
    // {
    //     console.log(slider.computeBounds(
    //         [[[
    //             1, 2, [0, 1, 2], [2, 1, [3, 4, 5, 6], 3, 4, 5],
    //             4, 5
    //         ]]],
    //         i));
    // }
}

let fontGenerator = null;
function loadFont()
{
    // try {
    //     json = JSON.parse( text );
    // } catch ( e ) {
    //     console.warn( 'THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.' );
    //     json = JSON.parse( text.substring( 65, text.length - 2 ) );
    // }

    fontGenerator = new Font(Helvetiker);
    init();
    animate();
}

loadFont();
