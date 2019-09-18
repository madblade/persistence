/**
 * Author: madblade
 */


"use strict";

function Topology() {}

Topology.prototype.upperNeighbors = function(
    octoPoint, f, sizeX, sizeY)
{
    let i = octoPoint[0];
    let j = octoPoint[1];
    let val = f(i, j);
    var neighbors = [];
    if (i === 0)                {if (f(i+1, j) >= val) neighbors.push([i+1, j]);}
    else if (i === sizeX - 1)   {if (f(i-1, j) >= val) neighbors.push([i-1, j]);}
    else                        {if (f(i+1, j) >= val) neighbors.push([i+1, j]);
        if (f(i-1, j) >= val) neighbors.push([i-1, j]);}
    if (j === 0)                {if (f(i, j+1) >= val) neighbors.push([i, j+1]);}
    else if (j === sizeY - 1)   {if (f(i, j-1) >= val) neighbors.push([i, j-1]);}
    else                        {if (f(i, j+1) >= val) neighbors.push([i, j+1]);
        if (f(i, j-1) >= val) neighbors.push([i, j-1]);}
    if (i > 0 && j > 0)         {if (f(i-1, j-1) >= val) neighbors.push([i-1, j-1]);}
    if (i < sizeX - 1 && j < sizeY - 1)
    {if (f(i+1, j+1) >= val) neighbors.push([i+1, j+1]);}
    return neighbors;
};

Topology.prototype.getCriticalType = function(
    s1, s2, i, j, f)
{
    // Compute critical points
    let currentValue = f(i, j);
    let nBools = [
        f(i + 1, j)     > currentValue || (f(i + 1, j)     === currentValue && (i+1) * s1 + j < i * s1 + j) ,
        f(i + 1, j + 1) > currentValue || (f(i + 1, j + 1) === currentValue && (i+1) * s1 + j+1 < i * s1 + j) ,
        f(i, j + 1)     > currentValue || (f(i, j + 1)     === currentValue && (i) * s1 + j+1 < i * s1 + j) ,
        f(i - 1, j)     > currentValue || (f(i - 1, j)     === currentValue && (i-1) * s1 + j < i * s1 + j) ,
        f(i - 1, j - 1) > currentValue || (f(i - 1, j - 1) === currentValue && (i-1) * s1 + j-1 < i * s1 + j) ,
        f(i, j - 1)     > currentValue || (f(i, j - 1)     === currentValue && (i) * s1 + j-1 < i * s1 + j) ,
    ];
    let nbPlus = 0;
    let nbMinus = 0;
    let currentPlus = false;
    let currentMinus = false;
    let nbComponentPlus = 0;
    let nbComponentMinus = 0;
    for (let k = 0; k < nBools.length; ++k) {
        if (nBools[k]) {
            nbPlus++;
            if (!currentPlus) nbComponentPlus++;
            currentPlus = true;
            if (currentMinus) currentMinus = false;
        } else {
            nbMinus++;
            if (!currentMinus) nbComponentMinus++;
            currentMinus = true;
            if (currentPlus) currentPlus = false;
        }
    }
    // Don't forget to test modulo k!
    if (nBools[0]) {
        if (currentPlus && nbComponentMinus > 0) nbComponentPlus--;
    } else {
        if (currentMinus && nbComponentPlus > 0) nbComponentMinus--;
    }

    let type = "reg";
    if (nbComponentPlus === 0 && nbComponentMinus > 0) {
        type = "max";
    }
    if (nbComponentPlus > 0 && nbComponentMinus === 0) {
        type = "min";
    }
    if (nbComponentPlus + nbComponentMinus > 2) {
        type = "sad";
    }
    if (nbComponentMinus === 0 && nbComponentPlus === 0)
        console.log('No neighbors?');
    if (nbComponentMinus + nbComponentPlus > 4) {
        type = "mul";
    }

    return type;
};

Topology.prototype.computePersistenceDiagram = function(
    s1, s2, f)
{
    var cps;
    let pointType = new Array(s1);
    for (let i = 0; i < s1; ++i) pointType[i] = new Array(s2);
    let criticalPoints = [];

    // Compute critical points
    for (let i = 0; i < s1; ++i) {
        for (let j = 0; j < s2; ++j) {
            let currentValue = f(i, j);
            let nBools = [
                f(i + 1, j)     > currentValue || (f(i + 1, j)     === currentValue && (i+1) * s1 + j < i * s1 + j) ,
                f(i + 1, j + 1) > currentValue || (f(i + 1, j + 1) === currentValue && (i+1) * s1 + j+1 < i * s1 + j) ,
                f(i, j + 1)     > currentValue || (f(i, j + 1)     === currentValue && (i) * s1 + j+1 < i * s1 + j) ,
                f(i - 1, j)     > currentValue || (f(i - 1, j)     === currentValue && (i-1) * s1 + j < i * s1 + j) ,
                f(i - 1, j - 1) > currentValue || (f(i - 1, j - 1) === currentValue && (i-1) * s1 + j-1 < i * s1 + j) ,
                f(i, j - 1)     > currentValue || (f(i, j - 1)     === currentValue && (i) * s1 + j-1 < i * s1 + j) ,
            ];
            let nbPlus = 0;
            let nbMinus = 0;
            let currentPlus = false;
            let currentMinus = false;
            let nbComponentPlus = 0;
            let nbComponentMinus = 0;
            for (let k = 0; k < nBools.length; ++k) {
                if (nBools[k]) {
                    nbPlus++;
                    if (!currentPlus) nbComponentPlus++;
                    currentPlus = true;
                    if (currentMinus) currentMinus = false;
                } else {
                    nbMinus++;
                    if (!currentMinus) nbComponentMinus++;
                    currentMinus = true;
                    if (currentPlus) currentPlus = false;
                }
            }
            // Don't forget to test modulo k!
            if (nBools[0]) {
                if (currentPlus && nbComponentMinus > 0) nbComponentPlus--;
            } else {
                if (currentMinus && nbComponentPlus > 0) nbComponentMinus--;
            }

            if (nbComponentPlus === 0 && nbComponentMinus > 0) {
                pointType[i][j] = "max";
                criticalPoints.push([i, j, 'max', currentValue]);
            }
            if (nbComponentPlus > 0 && nbComponentMinus === 0) {
                pointType[i][j] = "min";
                criticalPoints.push([i, j, 'min', currentValue]);
            }
            if (nbComponentPlus + nbComponentMinus > 2) {
                pointType[i][j] = "sad";
                criticalPoints.push([i, j, 'sad', currentValue]);
            }
            if (nbComponentMinus === 0 && nbComponentPlus === 0)
                console.log('No neighbors?');
            if (nbComponentMinus + nbComponentPlus > 4) {
                pointType[i][j] = "mul";
                console.log('Multi-saddle?');
            }
            if (!pointType[i][j])
                pointType[i][j] = "reg";
        }
    }

    // Sort critical points
    criticalPoints.sort(function(a, b) { return a[3] - b[3]; });
    // console.log(criticalPoints);
    cps = criticalPoints;
    let criticalPointsId = 0;

    // Build level-sets (keep track of current level)
    // (progressive BFS on each level)
    // close each level
    let persistenceDiagram = [];

    // +1 level BFS
    let processedCritical = new Set();
    // let starters = [criticalPoints[criticalPointsId]];
    let starters = new Map();
    let globalMin = criticalPoints[criticalPointsId]; // I know it's matched with the global max.
    criticalPointsId++;
    let secondMin = criticalPoints[criticalPointsId];
    starters.set(criticalPointsId, [secondMin]);
    criticalPointsId++;
    let nbMaxNotAssigned = 0;
    let globalMax = criticalPoints[criticalPoints.length - 1];
    while (starters.size > 0)
    {
        let lowestRoundValue = Number.MAX_VALUE;
        // New BFS round.
        let nextRoundStarters = new Map();
        for (const k of starters.keys()) {
            let currentLowestRoundValue = Number.MIN_VALUE;
            let currentStarterKit = starters.get(k);

            // 0-level BFS
            let starter = criticalPoints[k];
            let starterType = pointType[starter[0]][starter[1]];
            processedCritical.add(starter[0] * s1 + starter[1]); // critical point hash.
            let nextStarterKit = [];

            let processed = new Set();
            let inlist = new Set();
            let builtPair = false;

            while (!builtPair && currentStarterKit.length > 0) {
                // Get min element.
                let currentElement = currentStarterKit.shift();
                let hashCurrentElement = currentElement[0] * s1 + currentElement[1];
                processed.add(hashCurrentElement);
                nextStarterKit = [];

                // Check if min has unprocessed neighbors.
                let ns = this.upperNeighbors(currentElement, f, s1, s2);
                if (ns.length > 0) {
                    for (let n = 0; n < ns.length; ++n) {
                        let cn = ns[n];
                        let hash1 = cn[0] * s1 + cn[1];
                        if (!processed.has(hash1) && !processedCritical.has(hash1) && !inlist.has(hash1))
                        {
                            inlist.add(hash1);
                            nextStarterKit.push(cn);
                        }
                    }
                }
                currentStarterKit = currentStarterKit.concat(nextStarterKit);
                currentStarterKit.sort(function(a, b) {return f(a[0], a[1]) - f(b[0], b[1]);});

                if (processedCritical.has(hashCurrentElement)) continue;
                if (currentElement[0] === starter[0] && currentElement[1] === starter[1]) {
                    processedCritical.add(hashCurrentElement);
                }
                if (!currentElement) {
                    console.log('No more neighbors to visit and no critical point encountered.');
                    nextRoundStarters.delete(k);
                    currentStarterKit = [];
                    continue;
                }

                let cn = currentElement;
                let firstVal = f(cn[0], cn[1]);
                currentLowestRoundValue = currentLowestRoundValue < firstVal ? firstVal : currentLowestRoundValue;
                let hash2 = cn[0] * s1 + cn[1];
                if (processedCritical.has(hash2)) continue;

                processed.add(hash2);
                // scan for critical
                if (!pointType[cn[0]]) debugger;
                let ct = pointType[cn[0]][cn[1]];
                if (ct === "reg") {
                } else if (ct === "max") {
                    if (starterType === "min") {
                        // Completed the global min-max pair.
                        if (k === 0 && cn[0] === globalMax[0] && cn[1] === globalMax[1]) {
                            processedCritical.add(hash2);
                            persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]]]);
                            builtPair = true;
                            console.log('Should only happen once: min matched max.');
                        } else {
                            console.log('Reached a max before a saddle.');
                        }
                    }
                    else if (starterType === "sad") {
                        // Completed current sad-max pair.
                        processedCritical.add(hash2);
                        persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]]]);
                        builtPair = true;
                    }
                } else if (ct === "sad") {
                    if (starterType === "min") {
                        // Completed current min-sad pair.
                        processedCritical.add(hash2);
                        // Not considering min-sad pairs!
                        persistenceDiagram.push([[starter[0], starter[1]], [cn[0], cn[1]]]);
                        builtPair = true;
                    } else if (starterType === "sad"){
                        // console.log('I don\'t know if this should happen often. two saddles are linked.');
                    }
                } else if (ct === "min") {
                    console.log('Error: should not have encountered a min.');
                }

                if (builtPair) {
                    nextStarterKit = [];
                    currentStarterKit = [];
                    break;
                }

                if (currentStarterKit.length > 0 && !builtPair) {
                    if (lowestRoundValue > currentLowestRoundValue)
                        lowestRoundValue = currentLowestRoundValue;
                } else {
                    currentStarterKit = [];
                }
            }

            nextRoundStarters.delete(k);
        }

        // Review non-visited criticalPoints.
        for (let i = criticalPointsId; i < criticalPoints.length; ++i)
        {
            let c = criticalPoints[i];
            let hash = c[0] * s1 + c[1];
            if (!processedCritical.has(hash)) {
                if (c[3] > lowestRoundValue && nextRoundStarters.size > 0) break;

                let ct = pointType[c[0]][c[1]];
                if (ct === 'max') {
                    nbMaxNotAssigned++;
                    if (nbMaxNotAssigned > 1)
                        console.log('A max was not assigned, this should only happen on the border.');
                }
                else if (ct === 'min' || ct === 'sad')
                {
                    criticalPointsId = i;
                    if (nextRoundStarters.has(i))
                        console.log('Error: an unvisited critical is already present in the next round starter list.');
                    nextRoundStarters.set(i, [criticalPoints[i]]);
                    break;
                }
            }
        }

        starters = nextRoundStarters;
    }

    // Dirtily remove saddle-global assignments
    for (let i = persistenceDiagram.length - 1; i >= 0; --i) {
        let pp = persistenceDiagram[i];
        let pp1 = pp[0];
        let pp2 = pp[1];
        if (pp1[0] === globalMin[0] && pp1[1] === globalMin[1] ||
            pp2[0] === globalMin[0] && pp2[1] === globalMin[1] ||
            pp1[0] === globalMax[0] && pp1[1] === globalMax[1] ||
            pp2[0] === globalMax[0] && pp2[1] === globalMax[1])
        {
            persistenceDiagram.splice(i, 1);
        }
    }

    persistenceDiagram.unshift([[globalMin[0], globalMin[1]], [globalMax[0], globalMax[1]]]);
    return [cps, persistenceDiagram];
};

export default Topology;
