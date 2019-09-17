import {
    Euler,
    Group,
    Plane, Quaternion,
    Vector3,
} from "three";
import Topology from "./Topology";

function Content1() {}

Content1.prototype.getSlides = function(
    plotter, camera, fontGenerator)
{

    let lookAt2 = new Quaternion();
    let upv2 = new Vector3(0, 1, 0);
    lookAt2.setFromAxisAngle(upv2.normalize(), Math.PI/2);

    let lookAt3 = new Quaternion();
    let upv3 = new Vector3(1, 0, 0);
    lookAt3.setFromAxisAngle(upv3.normalize(), -Math.PI/8);

    lookAt2.multiply(lookAt3);

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
    let curve2dWireframe = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        0
    );

    let topology = new Topology();

    let generator = plotter.generatorCurve2d.bind(plotter);
    let evaluator = plotter.evaluateFromExpressionAndExtent2d;
    let pointEvaluator = plotter.evaluatePointFromExpressionAndExtent2d;
    let persistenceDiagram = topology.computePersistenceDiagram(
        sampling2d, sampling2d,
        evaluator(generator, extent, sampling2d, sampling2d)
    );
    let criticalPoints = persistenceDiagram[0];
    let persistencePairs = persistenceDiagram[1];

    // Find critical points
    let min = [];
    let max = [];
    let sad = [];
    for (let i = 0; i < criticalPoints.length; ++i) {
        let c = criticalPoints[i];
        let point = pointEvaluator(generator, extent, sampling2d, sampling2d)(c[0], c[1]);
        switch (c[2]) {
            case 'min': min.push(point); break;
            case 'max': max.push(point); break;
            case 'sad': sad.push(point); break;
            default: break;
        }
    }
    let minMesh = new Group();
    let maxMesh = new Group();
    let sadMesh = new Group();
    for (let i = 0; i < min.length; ++i) {
        minMesh.add(plotter.makeSprite1d(min[i], "#ff0000", true));
    }
    for (let i = 0; i < max.length; ++i) {
        maxMesh.add(plotter.makeSprite1d(max[i], "#0000ff", true));
    }
    for (let i = 0; i < sad.length; ++i) {
        sadMesh.add(plotter.makeSprite1d(sad[i], "#ffffff", true));
    }

    return [
        {
            mesh: curve2dWireframe
        },
        {
            mesh: minMesh,
        },
        {
            mesh: maxMesh,
        },
        {
            mesh: sadMesh,
        },
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
    ];
};

export default Content1;
