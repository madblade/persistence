import {
    Plane,
    Quaternion,
    Vector3,
} from "three";

function Content1() {}

Content1.prototype.getSlides = function(
    plotter, camera, fontGenerator)
{
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
    smin1.position.z += 0.05;
    smin2.position.z += 0.05;
    smin3.position.z += 0.05;
    smin4.position.z += 0.05;
    smin5.position.z += 0.05;
    smin6.position.z += 0.05;

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
    smax1.position.z += 0.05;
    smax2.position.z += 0.05;
    smax3.position.z += 0.05;
    smax4.position.z += 0.05;
    smax5.position.z += 0.05;


    let curve1d = plotter.make1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );
    let largeCurve1d = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent
    );

    let lookAt1 = new Quaternion();
    let upv1 = new Vector3(0, 1, 0);
    lookAt1.setFromAxisAngle(upv1.normalize(), 0);

    let domainText = plotter.makeText(
        'D', fontGenerator,
        new Vector3(14, -19, 0), '#006699'
    );
    let rangeText = plotter.makeText(
        'R', fontGenerator,
        new Vector3(-18, 15, 0), '#006699'
    );
    let dataText = plotter.makeText(
        'f', fontGenerator,
        new Vector3(18, -5, 0), '#0011aa'
    );


    // Curves mess

    // Light Blue
    let lightBlueCurve2 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -14.3), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve3 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -14.05), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve1 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -13.2), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve4 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -11.3), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve5 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -10.8), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve6 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -10.18), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );
    let lightBlueCurve7 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 2,
        [
            new Plane(new Vector3(1, 0, 0), -9.85), // left cut
            // new Plane(new Vector3(-1, 0, 0), 5),
        ]
    );

    // Green
    let greenCurve1 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 4,
        [
            new Plane(new Vector3(-1, 0, 0), 13.2), // right cut
            new Plane(new Vector3(1, 0, 0), -11.3), // left cut
        ]
    );
    let greenCurve2 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 4,
        [
            new Plane(new Vector3(-1, 0, 0), 6.52), // right cut
            new Plane(new Vector3(1, 0, 0), -3.95), // left cut
        ]
    );
    let greenCurve3 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 4,
        [
            new Plane(new Vector3(-1, 0, 0), 6.89), // right cut
            new Plane(new Vector3(1, 0, 0), -2.9), // left cut
        ]
    );

    // Orange
    let orangeCurve1 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), -0.3), // right cut
            new Plane(new Vector3(1, 0, 0), 5.70), // left cut
        ]
    );
    let orangeCurve3 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 0.30), // right cut
            new Plane(new Vector3(1, 0, 0), 5.87), // left cut
        ]
    );
    let orangeCurve2 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 0.52), // right cut
            new Plane(new Vector3(1, 0, 0), 5.95), // left cut
        ]
    );
    let orangeCurve4 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 0.72), // right cut
            new Plane(new Vector3(1, 0, 0), 6.05), // left cut
        ]
    );
    let orangeCurve5 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 1.15), // right cut
            new Plane(new Vector3(1, 0, 0), 6.35), // left cut
        ]
    );
    let orangeCurve6 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 1.92), // right cut
            new Plane(new Vector3(1, 0, 0), 7.5), // left cut
        ]
    );
    let orangeCurve7 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 1.92), // right cut
            new Plane(new Vector3(1, 0, 0), 11.62), // left cut
        ]
    );
    let orangeCurve8 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 2.9), // right cut
            new Plane(new Vector3(1, 0, 0), 11.92), // left cut
        ]
    );
    let orangeCurve9 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
        [
            new Plane(new Vector3(-1, 0, 0), 6.89), // right cut
            new Plane(new Vector3(1, 0, 0), 11.92), // left cut
        ]
    );
    let orangeCurve10 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 1,
    );

    // Purple
    let purpleCurve1 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 3,
        [
            new Plane(new Vector3(-1, 0, 0), -9.38), // right cut
            new Plane(new Vector3(1, 0, 0), 10.48), // left cut
        ]
    );
    let purpleCurve2 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 3,
        [
            new Plane(new Vector3(-1, 0, 0), -9.18), // right cut
            new Plane(new Vector3(1, 0, 0), 10.65), // left cut
        ]
    );
    let purpleCurve3 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 3,
        [
            new Plane(new Vector3(-1, 0, 0), -8.74), // right cut
            new Plane(new Vector3(1, 0, 0), 11.02), // left cut
        ]
    );
    let purpleCurve4 = plotter.makeLarge1dCurve(
        plotter.generatorCurve1d.bind(plotter), sampling1d, extent, 3,
        [
            new Plane(new Vector3(-1, 0, 0), -7.5), // right cut
            new Plane(new Vector3(1, 0, 0), 11.62), // left cut
        ]
    );

    let groupOrangeLightBlue1 = plotter.makeGroup();
    groupOrangeLightBlue1.add(lightBlueCurve2.clone());
    groupOrangeLightBlue1.add(orangeCurve3.clone());

    let groupOrangePurpleLightBlue1 = plotter.makeGroup();
    groupOrangePurpleLightBlue1.add(orangeCurve2.clone());
    groupOrangePurpleLightBlue1.add(lightBlueCurve3.clone());
    groupOrangePurpleLightBlue1.add(purpleCurve1.clone());

    let groupOrangePurpleLightBlueGreen1 = plotter.makeGroup();
    groupOrangePurpleLightBlueGreen1.add(lightBlueCurve1.clone());
    groupOrangePurpleLightBlueGreen1.add(greenCurve1.clone());
    groupOrangePurpleLightBlueGreen1.add(orangeCurve4.clone());
    groupOrangePurpleLightBlueGreen1.add(purpleCurve2.clone());

    // Fusion
    let groupOrangePurpleLightBlue2 = plotter.makeGroup();
    groupOrangePurpleLightBlue2.add(lightBlueCurve4.clone());
    groupOrangePurpleLightBlue2.add(orangeCurve4.clone());
    groupOrangePurpleLightBlue2.add(purpleCurve2.clone());
    groupOrangePurpleLightBlue2.position.z += 0.01;

    let groupOrangePurpleLightBlue3 = plotter.makeGroup();
    groupOrangePurpleLightBlue3.add(orangeCurve5.clone());
    groupOrangePurpleLightBlue3.add(lightBlueCurve5.clone());
    groupOrangePurpleLightBlue3.add(purpleCurve3.clone());

    let groupOrangePurpleLightBlueGreen2 = plotter.makeGroup();
    groupOrangePurpleLightBlueGreen2.add(orangeCurve6.clone());
    groupOrangePurpleLightBlueGreen2.add(purpleCurve4.clone());
    groupOrangePurpleLightBlueGreen2.add(greenCurve2.clone());
    groupOrangePurpleLightBlueGreen2.add(lightBlueCurve6.clone());

    // Fusion
    let groupOrangeGreenLightBlue1 = plotter.makeGroup();
    groupOrangeGreenLightBlue1.add(orangeCurve7.clone());
    groupOrangeGreenLightBlue1.add(greenCurve2.clone());
    groupOrangeGreenLightBlue1.add(lightBlueCurve6.clone());
    groupOrangeGreenLightBlue1.position.z += 0.01;

    let groupOrangeGreenLightBlue2 = plotter.makeGroup();
    groupOrangeGreenLightBlue2.add(orangeCurve8.clone());
    groupOrangeGreenLightBlue2.add(greenCurve3.clone());
    groupOrangeGreenLightBlue2.add(lightBlueCurve7.clone());

    let groupOrangeLightBlue2 = plotter.makeGroup();
    groupOrangeLightBlue2.add(orangeCurve9.clone());
    groupOrangeLightBlue2.add(lightBlueCurve7.clone());
    groupOrangeLightBlue2.position.z += 0.01;

    let lastCriticalPoints = plotter.makeGroup();
    lastCriticalPoints.add(smin6);
    lastCriticalPoints.add(smax4);
    lastCriticalPoints.add(smax5);

    return [
        {
            mesh: xyHelper,
            animateIn: fadeIn,
            opacityMax: 0.5,
            explainText: 'Persistent homology on an example.',
        },
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
            explainText: 'Consider a function defined on a 1-dimensional domain.',
        },
        {
            mesh: xHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut,
            explainText: 'The domain is represented by the x-axis.',
        },
        {
            mesh: domainText,
            explainText: 'The domain is represented by the x-axis.',
        },
        {
            mesh: yHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut,
            explainText: 'The 1-dimensional function range is represented on the y-axis.',
        },
        {
            mesh: rangeText,
            explainText: 'The 1-dimensional function range is represented on the y-axis.',
        },
        {
            mesh: curve1d,
            animateIn: swipeInRight,
            duration: 45,
            explainText: 'The function is represented with a piecewise-linear curve. ',
        },
        {
            mesh: dataText,
            explainText: 'The function is represented with a piecewise-linear curve. ',
        },

        // START MESS

        {
            mesh: smin1,
            explainText: 'The global minimum of the function is highlighted in red. ',
            removeAfter: [curve1d]
        },
        // {
        //     mesh: largeCurve1d,
        //     animateIn: swipeInUp({y: [-15, -5]}),
        //     duration: 90,
        //     explainText: '',
        // },
        {
            mesh: orangeCurve1,
            removeAfter: [],
            animateIn: swipeInUp({y: [-15, -5]}),
            duration: 20,
            explainText: 'Now consider a filtration (a bottom-up swipe) of the function. ',
        },
        {
            explainText: 'Starting from the lowest value, the filtration contains' +
                ' at first one connected component. ',
        },
        {
            mesh: smin2,
            explainText: 'Until the second local minimum is reached: '+
                'there are now two connected components. '
        },

        // Group 1
        {
            mesh: groupOrangeLightBlue1,
            removeAfter: [orangeCurve1],
            animateIn: swipeInUp({y: [-5, -4]}),
            duration: 20,
            explainText: 'Until the second local minimum is reached: ' +
                'there are now two connected components. ',
        },
        {
            mesh: smin3,
            explainText: 'The third minimum is reached. ',
        },


        // Group 2
        {
            mesh: groupOrangePurpleLightBlue1,
            removeAfter: [groupOrangeLightBlue1],
            animateIn: swipeInUp({y: [-4, -3.2]}),
            duration: 20,
            explainText: 'Therefore the filtration contains three ' +
                'connected components (three separate pieces). ',
        },
        {
            mesh: smin4,
            explainText: 'The fourth local minimum is encountered. ',
        },

        // Group 3
        {
            mesh: groupOrangePurpleLightBlueGreen1,
            removeAfter: [groupOrangePurpleLightBlue1],
            animateIn: swipeInUp({y: [-3.2, -2.3]}),
            duration: 20,
            explainText: 'At this moment, something happens: ' +
                'two connected components merge into one. ',
        },
        {
            mesh: smax1,
            explainText: 'This corresponds to a local maximum. ',
        },

        // Group 4 JOIN
        {
            mesh: groupOrangePurpleLightBlue2,
            explainText: 'The color of the <b>oldest</b> component is given to the union: ' +
                'this is called the <b>Elder Rule</b>. ',
        },

        {
            explainText: 'The local maximum where the merging occurs is associated to ' +
                'the local minimum of the <b>youngest</b> merged component. ',
        },
        {
            explainText: 'Critical points (minima and maxima) are thus associated ' +
                'in pairs. ',
        },
        {
            removeAfter: [groupOrangePurpleLightBlueGreen1],
            explainText: 'These pairs are called <b>persistence pairs</b>; ' +
                'their value difference is called the <b>persistence</b>. ',
        },

        // Group 5
        {
            mesh: groupOrangePurpleLightBlue3,
            removeAfter: [groupOrangePurpleLightBlue2],
            animateIn: swipeInUp({y: [-2.3, 0]}),
            duration: 20,
            explainText: 'Going on with the swipe... ',
        },
        {
            mesh: smin5,
            explainText: '... a new local minimum is encountered, ' +
                'which means a new connected component. ',
        },


        // Group 6
        {
            mesh: groupOrangePurpleLightBlueGreen2,
            removeAfter: [groupOrangePurpleLightBlue3],
            animateIn: swipeInUp({y: [0, 4.2]}),
            duration: 20,
            explainText: 'Go on with the filtration... ',
        },
        {
            mesh: smax2,
            explainText: '... until, here, a maximum is reached. ',
        },

        // Group 7 JOIN
        {
            mesh: groupOrangeGreenLightBlue1,
            removeAfter: [groupOrangePurpleLightBlueGreen2],
            explainText: 'According to the <b>Elder Rule</b>, ' +
                'the oldest component absorbs the youngest.',
        },
        {
            explainText: 'And the maximum is associated with the minimum ' +
                'of the youngest (here, purple) component in a persistence pair. ',
        },

        // Group 8
        {
            mesh: groupOrangeGreenLightBlue2,
            removeAfter: [groupOrangeGreenLightBlue1],
            animateIn: swipeInUp({y: [4.2, 6.8]}),
            duration: 20,
            explainText: 'Continue the bottom-up filtration. ' +
            'This filtrated function is sometimes called a <b>sub-level set</b>. ',
        },
        {
            mesh: smax3,
            explainText: 'Another maximum. ',
        },

        // Group 9 JOIN
        {
            mesh: groupOrangeLightBlue2,
            removeAfter: [groupOrangeGreenLightBlue2, groupOrangeLightBlue2],
            explainText: 'Which means the Elder Rule is invoked again. ',
        },

        // end of line (at last)
        {
            mesh: orangeCurve10,
            animateIn: swipeInUp({y: [6.8, 15]}),
            duration: 20,
            explainText: 'In the end, there is only one connected component left. ',
        },

        {
            mesh: lastCriticalPoints,
            // animateIn: swipeInUp({y: [12, 15]}),
            // duration: 50,
            removeAfter: [
                xyHelper, xHelper, rangeText, domainText, dataText,
                orangeCurve10,
                smin1, smin2, smin3, smin4, smin5,
                smax1, smax2, smax3,
                lastCriticalPoints
            ],
            explainText: 'All critical points are shown here. ' +
                'Notice that for this case they are only maxima and minima. ',
        }

        /// END MESS
    ];

};

export default Content1;
