/**
 * Stuff to run on resize.
 */
$(window).resize(function() {
    waitForFinalEvent(function() {

    }, 200, "");
});


/**
 * Helper function to delay firing resize events until the user 
 * stops resizing their browser.
 */
var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout (timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();


/**
 * Helper function that returns a random number between the two supplied
 * numbers. 
 */
function rando(min, max) {
  return Math.random() * (max - min) + min;
}


function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function initTreeEffects() {
    /* D3 Tree */
    /* Copyright 2013 Peter Cook (@prcweb); Licensed MIT */

    // Tree configuration
    var branches  = [],
        winHeight = window.innerHeight,
        winWidth  = window.innerWidth,
        seed = {
            i: 0,           
            x: winWidth/2, // X point
            y: winHeight,  // Y point
            a: 0,          // Angle
            l: winHeight/5,        // Length
            d: 0,           // Depth
            parent: null
        },
        newBL = {},
        newBR = {},
        clicks = 0,
        doneGrowing = false,
        filled = false,
        curDepth = 0,
        maxDepth = 8, 
        prevParent = 0,
        svg = d3.select("body")
                .style("margin", 0)
                .append("svg")
                .attr("width", winWidth)
                .attr("height", winHeight)
                .attr("class", "d3-svg");


    /**
     * Recursive version of the function that creates a tree by 
     * adding branches to an array. Takes a bit more time and 
     * uses more memory.
     */
    function recursiveBranch(b, depth) {
        var end = endPt(b), daR, newB;
        branches.push(b);
        console.log(depth);
        if (depth >= maxDepth) {
            return;
        } else {
            depth += 1;
            // Left branch
            daR = ar * Math.random() - ar * 0.5;
            newBL = {
                i: branches.length,
                x: end.x,
                y: end.y,
                a: b.a - da + daR,
                l: b.l * dl,
                d: depth,
                parent: b.i
            };
            branch(newBL, depth);

            // Right branch
            daR = ar * Math.random() - ar * 0.5;
            newBR = {
                i: branches.length,
                x: end.x, 
                y: end.y, 
                a: b.a + da + daR, 
                l: b.l * dl, 
                d: depth,
                parent: b.i
            };
            branch(newBR, depth);
        }   
    }


    function regenerate(initialise) {
        branches = [seed];
        initialise ? create() : update();
    }

    function endPt(b) {
        // Return endpoint of branch
        var x = b.x + b.l * Math.sin( b.a );
        var y = b.y - b.l * Math.cos( b.a );
        return {x: x, y: y};
    }

    // D3 functions
    function x1(d) { return d.x; }
    function y1(d) { return d.y; }
    function x2(d) { return endPt(d).x; }
    function y2(d) { return endPt(d).y; }

    /**
     * This function takes each line of the SVG item and layers
     * it from top to bottom of the sreen, taking up the full 
     * width, until the entire screen is covered.
     */
    function fillScreen(d) {
        var lines       = d3.select('.d3-svg').selectAll('line')[0],
            numLines    = lines.length,
            panelHeight = winHeight/numLines;

        // loop through all of the lines on the canvas and move
        // them to their computed location, overlaying the screen.
        for (var i = 0; i < numLines; i++) {
            if (i > winHeight) {
                lines[i].remove();
            } else {
                d3.select(lines[i])
                    .style('stroke-dasharray', 0)
                    .transition()
                    .duration((i+1000) * 2)
                    .style('stroke-width', function() {
                        return panelHeight + 5 + 'px';
                    })
                    .attr('x1', 0)
                    .attr('y1', function() {
                        return (panelHeight/2) + (Math.max(panelHeight, 1)*i);
                    })
                    .attr('x2', winWidth)
                    .attr('y2', function() {
                        return (panelHeight/2) + (Math.max(panelHeight, 1)*i);
                    });
            }
        }
    }


    /**
     * Adds a layer to the current structure. Cycles through all of the current 
     * branches, and adds new branches to the ones that are in the outer 
     * most layer.
     */
    function addLayer() {
        var numBranches = branches.length;
        
        // loop through all of the branches currently in our array.
        for (var i = 0; i < numBranches; i++) {
            var curParent = branches[i];

            // if the branch is in the outer most layer, create two new
            // child branches and add them to the current branch
            if (curParent.d === curDepth) {
                console.log("End Point X: ", endPt(curParent).x);
                console.log("End Point Y: ", endPt(curParent).y);
                branchLeft = {
                    i: ++clicks,
                    x: endPt(curParent).x, // X point
                    y: endPt(curParent).y, // Y point
                    a: curParent.a - rando(0.2, 1),    // Angle
                    l: curParent.l / 1.3,  // Length
                    d: curDepth + 1,          // Depth
                    parent: i
                }

                branches.push(branchLeft);

                branchRight = {
                    i: ++clicks,
                    x: endPt(curParent).x, // X point
                    y: endPt(curParent).y, // Y point
                    a: curParent.a + rando(0.2, 1),    // Angle
                    l: curParent.l / 1.3,  // Length
                    d: curDepth + 1,           // Depth
                    parent: i
                }

                branches.push(branchRight);
            }
        }

        if ((curDepth++) >= maxDepth) doneGrowing = true;

        // console.log("Num branches: ", numBranches);
        // console.log("Current Depth: ", curDepth);
        // console.log("Current Branch Depth: ", curParent.d);
        // console.log("Done Growing? ", doneGrowing);
        create();
    }


    /**
     * Creates the tree by calling the recursive draw function
     * and adding a line for each piece of data it creates.
     */
    function create() {
        d3.select('.d3-svg')
            .selectAll('line')
            .data(branches)
            .enter()
            .append('line')
            .style("stroke", getRandomColor())
            .style('stroke-dasharray', 180)
            .style('stroke-dashoffset', 180)
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('id', function(d) {return 'id-'+d.i;})
            .style('stroke-width', function(d) {return parseInt(10 - curDepth) + 'px';})
            .transition()
            .duration(function(d) {return d.d * 500;})
            .style('stroke-dashoffset', 0);
    }

    function update() {
        d3.select('.d3-svg')
            .selectAll('line')
            .data(branches)
            .transition()
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2);
    }


    setTimeout(fillScreen, (maxDepth-1) * 500); 
    d3.timer(function(elapsed) {
        // console.log("Timer Called: ", elapsed);
        if (!doneGrowing) {
            if(elapsed % 8 === 0)
                addLayer();
        } else {
            return true;
        }
    });

    regenerate(true); 
}// END initTreeEffects

$(document).ready(function() {
  initTreeEffects();
});

