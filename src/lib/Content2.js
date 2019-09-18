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

    let lookAt4 = new Quaternion();
    let upv4 = new Vector3(0, 1, 0);
    lookAt4.setFromAxisAngle(upv4.normalize(), Math.PI/2);
    let lookAt5 = new Quaternion();
    let upv5 = new Vector3(1, 0, 0);
    lookAt5.setFromAxisAngle(upv5.normalize(), -Math.PI/8);
    lookAt4.multiply(lookAt5);

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
    let curve2dClippable1 = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );
    curve2dClippable1.material.clippingPlanes = [
        new Plane(new Vector3(0, -1, 0), 15)
    ];
    let curve2dClippable2 = curve2dClippable1.clone();
    let curve2dt = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );

    let domain2Text = plotter.makeText(
        'D', fontGenerator,
        new Vector3(8, -15, -31), '#006600',
        new Euler(-Math.PI / 2, 0, 0, 'XYZ') // rotation
    );
    let range2Text = plotter.makeText(
        'R', fontGenerator,
        new Vector3(-16, 15, 4), '#006600',
        new Euler(0, Math.PI / 2, 0, 'XYZ') // rotation
    );
    let groupText = new Group();
    groupText.add(domain2Text);
    groupText.add(range2Text);

    let curve2dTransparent = plotter.make2dCurve(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent
    );
    let curve2dWireframeMin1 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        100, 55
    );
    let curve2dWireframeMin2 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        115, 78
    );
    let curve2dWireframeSad1 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        110, 67
    );
    let curve2dWireframeSad2 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        110, 41
    );
    let curve2dWireframeMax1 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        99, 77
    );
    let curve2dWireframeMax2 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        63, 60
    );
    let curve2dWireframeReg1 = plotter.make2dCurveWireframeColor(
        plotter.generatorCurve2d.bind(plotter), sampling2d, extent,
        75, 55
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

    let ev = pointEvaluator(generator, extent, sampling2d, sampling2d);
    let pointMin1 = ev(100, 55);
    let spriteMin1 = plotter.makeSprite1d(pointMin1, "#ff0000", true);
    let pointMin2 = ev(115, 78);
    let spriteMin2 = plotter.makeSprite1d(pointMin2, "#ff0000", true);
    let pointSad1 = ev(110, 67);
    let spriteSad1 = plotter.makeSprite1d(pointSad1, "#ffffff", true);
    let pointSad2 = ev(110, 41);
    let spriteSad2 = plotter.makeSprite1d(pointSad2, "#ffffff", true);
    let pointMax1 = ev(99, 77);
    let spriteMax1 = plotter.makeSprite1d(pointMax1, "#0000ff", true);
    let pointMax2 = ev(63, 60);
    let spriteMax2 = plotter.makeSprite1d(pointMax2, "#0000ff", true);
    let pointReg1 = ev(75, 55);
    let spriteReg1 = plotter.makeSprite1d(pointReg1, "#000000", true);
    spriteReg1.position.x += 0.3;
    spriteReg1.position.y -= 0.3;

    // Find all critical points
    let min = [];
    let max = [];
    let sad = [];
    for (let i = 0; i < criticalPoints.length; ++i) {
        let c = criticalPoints[i];
        let point = ev(c[0], c[1]);
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
        sadMesh.add(plotter.makeSprite1d(sad[i], "#aaaaaa", true));
    }

    let groupMin = new Group();
    groupMin.add(curve2dWireframeMin1);
    groupMin.add(curve2dWireframeMin2);
    let groupMax = new Group();
    groupMax.add(curve2dWireframeMax1);
    groupMax.add(curve2dWireframeMax2);
    let groupSad = new Group();
    groupSad.add(curve2dWireframeSad1);
    groupSad.add(curve2dWireframeSad2);

    let groupSpriteMax = new Group();
    groupSpriteMax.add(spriteMax1);
    groupSpriteMax.add(spriteMax2);
    let groupSpriteSad = new Group();
    groupSpriteSad.add(spriteSad1);
    groupSpriteSad.add(spriteSad2);
    let groupSpriteMin = new Group();
    groupSpriteMin.add(spriteMin1);
    groupSpriteMin.add(spriteMin2);

    // Build persistence mesh
    let persistenceMesh = new Group();
    for (let i = 0; i < persistencePairs.length; ++i) {
        let pp = persistencePairs[i];
        let cp1 = pp[0];
        let cp2 = pp[1];
        let point1 = ev(cp1[0], cp1[1]);
        let point2 = ev(cp2[0], cp2[1]);
        let segment = plotter.makeLargeSegment(point1, point2);
        persistenceMesh.add(segment);
    }

    return [
        {
            mesh: curve1d2,
            explainText: 'Critical points are assembled in <b>persistence</b> pairs, ' +
                'which are min-max pairs for 1-dimensional domains. '
        },
        {
            explainText: '<b>Persistent homology</b> studies this set of persistence pairs, ' +
                'sometimes represented in plots called persistence diagrams. '
        },
        {
            camera: camera,
            target: {
                position1: new Vector3(), // reset by slider
                position2: new Vector3(55, 20, -15),
                quaternion1: new Quaternion(), // reset by slider
                quaternion2: lookAt2,
                controlTarget: new Vector3(5, 0, -15)
            },
            transition: smootherCamera,
            duration: 50,
            explainText: 'Let us see how this extends to two dimensions. '
        },
        {
            mesh: zHelper,
            animateIn: stretchIn,
            explainText: 'So let us add a dimension to our domain. '
            // animateOut: stretchOut
        },
        {
            mesh: xzHelper,
            animateIn: swipeInBack,
            opacityMax: 0.5, // to be fixed someday
            explainText: 'So let us add a dimension to our domain. '
        },
        {
            mesh: groupText,
            explainText: 'So let us add a dimension to our domain. '
        },
        {
            mesh: curve2d,
            animateIn: swipeInBack, // left-to-right camera
            duration: 50,
            removeAfter: [curve2d],
            explainText: 'And let us extend the function to this domain. '
        },
        {
            mesh: curve2dTransparent,
            opacityMax: 0.1,
            explainText: 'The function is computationally represented ' +
                'by a piecewise-linear mesh. '
        },

        // Demo minima
        {
            camera: camera,
            target: {
                position1: new Vector3(), // reset by slider
                position2: new Vector3(25, 5, -15),
                quaternion1: new Quaternion(), // reset by slider
                quaternion2: lookAt4,
                controlTarget: new Vector3(5, -5, -15)
            },
            transition: smootherCamera,
            duration: 50,
            explainText: 'Let us examine critical points. '
        },
        {
            mesh: groupMin,
            explainText: 'Local minima can be detected due to their ' +
                'neighborhood only showing higher values. '
        },
        {
            mesh: groupSpriteMin,
            removeAfter: [groupMin],
            explainText: 'Local minima can be detected due to their ' +
                'neighborhood only showing higher values. '
        },
        {
            mesh: curve2dClippable1,
            animateIn: swipeInUp({y: [-15, 0.1]}),
            duration: 90,
            removeAfter: [groupSpriteMin],
            explainText: 'Local minima can be detected due to their ' +
                'neighborhood only showing higher values. '
        },

        // Demo saddles
        {
            camera: camera,
            target: {
                position1: new Vector3(), // reset by slider
                position2: new Vector3(25, 5, -12.5),
                quaternion1: new Quaternion(), // reset by slider
                quaternion2: lookAt4,
                controlTarget: new Vector3(5, -5, -12.5)
            },
            transition: smootherCamera,
            duration: 50,
            explainText: 'But there are other types of critical points: <b>saddles</b>. '
        },
        {
            mesh: groupSad,
            explainText: 'In the neighborhood of saddles, higher points ' +
                'and lower points are disconnected in more than two groups (here, four). '
        },
        {
            mesh: groupSpriteSad,
            removeAfter: [groupSad],
            explainText: 'In the neighborhood of saddles, higher points ' +
                'and lower points are disconnected in more than two groups (here, four). '
        },
        {
            camera: camera,
            target: {
                position1: new Vector3(), // reset by slider
                position2: new Vector3(55, 20, -15),
                quaternion1: new Quaternion(), // reset by slider
                quaternion2: lookAt4,
                controlTarget: new Vector3(5, 0, -15)
            },
            transition: smootherCamera,
            duration: 50,
            explainText: 'Then, as for the 1-dimensional case, there are local maxima. '
        },
        {
            mesh: curve2dClippable2,
            animateIn: swipeInUp({y: [0.1, 5]}),
            duration: 90,
            removeAfter: [groupSpriteSad, curve2dClippable1],
            explainText: 'Then, as for the 1-dimensional case, there are local maxima. '
        },

        // Demo maxima
        {
            mesh: groupMax,
            explainText: 'Maxima have neighborhoods with only lower points. '
        },
        {
            mesh: groupSpriteMax,
            removeAfter: [groupMax],
            explainText: 'Maxima have neighborhoods with only lower points. '
        },
        {
            mesh: curve2dClippable1,
            animateIn: swipeInUp({y: [5, 15]}),
            duration: 90,
            removeAfter: [groupSpriteMax, curve2dClippable2],
            explainText: 'Maxima have neighborhoods with only lower points. '
        },

        // Demo regular
        {
            mesh: curve2dWireframeReg1,
            explainText: 'Any other point has a neighborhood which is cut in exactly ' +
                'two pieces: one higher, one lower. '
        },
        {
            mesh: spriteReg1,
            removeAfter: [
                spriteReg1, curve2dWireframeReg1, curve2dClippable1
            ],
            explainText: 'These are called regular points. '
        },

        {
            removeAfter: []
        },

        // All critical points
        {
            mesh: minMesh,
            explainText: 'These are all minima... '
        },
        {
            mesh: maxMesh,
            explainText: '... all maxima... '
        },
        {
            mesh: sadMesh,
            explainText: '... and all saddles. '
        },
        {
            mesh: persistenceMesh,
            explainText: 'As in the previous case, ' +
                'critical points are associated in pairs by analyzing ' +
                'merging events of the sub-level filtration. '
        },
        {
            explainText: 'Here we show min-saddle and saddle-max pairs. ' +
                'Every point belongs to exactly one pair. '
        },
        {
            removeAfter: [
                persistenceMesh,
                curve2dTransparent,
                minMesh, maxMesh, sadMesh
            ],
            explainText: '(there are also saddle-saddle pairs)'
        },
        {
            mesh: curve2d,
            removeAfter: [curve2d, curve1d2],
            explainText: 'This extends smoothly to 3 dimensions. '
        },

        // Towards tracking and higher-dimensional homology
        {
            mesh: curve2dt,
            animate: function(time, maxTime, mesh) {
                plotter.updateCurve2dt(
                    mesh, time, maxTime,
                    plotter.generatorCurve2d.bind(plotter),
                    sampling2d
                );
            },
            explainText: 'But another interesting question asks the evolution ' +
                'of persistent homology classes for time-varying functions. '
        },
        {
            removeAfter: [curve2dt],
            explainText: 'For instance, tracking persistence pairs throughout time is ' +
                'an interesting perspective of this subject. '
        },
        {
            explainText: 'Thank you for reading! '
        }
    ];
};

export default Content1;
