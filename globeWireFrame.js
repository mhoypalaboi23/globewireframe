import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class GlobeWireFrame {
    /**
     * Add animations to the globe
     * @param {HTMLElement} container - The container element for the globe
     */
    static addAnimations(container) {
        const style = document.createElement("style");
        style.textContent = `
            @keyframes wave {
                0% {
                    transform: scale(1);
                    opacity: 0.8;
                }
                66% {
                    transform: scale(3);
                    opacity: 0;
                }
                100% {
                    transform: scale(3);
                    opacity: 0;
                }
            }
            
            @keyframes drawLine {
                0% {
                    stroke-dashoffset: 1000;
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                60% {
                    opacity: 1;
                    stroke-dashoffset: 0;
                }
                65% {
                    opacity: 0;
                    stroke-dashoffset: 0;
                }
                100% {
                    opacity: 0;
                    stroke-dashoffset: 0;
                }
            }
            
            .circle-static {
                fill: #03E0B1;
            }
            
            .wave-ring {
                fill: none;
                stroke: #03E0B1;
                transform-origin: center center;
                transform-box: fill-box;
                opacity: 0;
            }
            
            .animated-line {
                 stroke: #03E0B1;
                stroke-width: 2px;
                fill: none;
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: drawLine 6s infinite;
            }
            
            // .animated-line-1 {
            //     animation: drawLine 4s infinite;
            // }
            
            // .animated-line-2 {
            //     animation: drawLine 4s infinite 0.8s;
            // }
            
            // .animated-line-3 {
            //     animation: drawLine 4s infinite 1.6s;
            // }
            
            // .animated-line-4 {
            //     animation: drawLine 4s infinite 2.4s;
            // }
            
            // .animated-line-5 {
            //     animation: drawLine 4s infinite 3.2s;
            // }

        
            
            .point-group .wave-ring:nth-child(2) { animation: wave 6s 0.8s infinite; }
            .point-group .wave-ring:nth-child(3) { animation: wave 6s 1.3s infinite; }
            .point-group .wave-ring:nth-child(4) { animation: wave 6s 1.8s infinite; }
            
            // .point-group-2 .wave-ring:nth-child(2) { animation: wave 2s 1.6s infinite; }
            // .point-group-2 .wave-ring:nth-child(3) { animation: wave 2s 2.1s infinite; }
            // .point-group-2 .wave-ring:nth-child(4) { animation: wave 2s 2.6s infinite; }
            
            // .point-group-3 .wave-ring:nth-child(2) { animation: wave 2s 2.4s infinite; }
            // .point-group-3 .wave-ring:nth-child(3) { animation: wave 2s 2.9s infinite; }
            // .point-group-3 .wave-ring:nth-child(4) { animation: wave 2s 3.4s infinite; }
            
            // .point-group-4 .wave-ring:nth-child(2) { animation: wave 2s 3.2s infinite; }
            // .point-group-4 .wave-ring:nth-child(3) { animation: wave 2s 3.7s infinite; }
            // .point-group-4 .wave-ring:nth-child(4) { animation: wave 2s 4.2s infinite; }
            
            // .point-group-5 .wave-ring:nth-child(2) { animation: wave 2s 4.0s infinite; }
            // .point-group-5 .wave-ring:nth-child(3) { animation: wave 2s 4.5s infinite; }
            // .point-group-5 .wave-ring:nth-child(4) { animation: wave 2s 5.0s infinite; }
        `;
        container.appendChild(style);
    }

    /**
     * Initialize the globe wireframe
     * @param {HTMLElement} container - The container element for the globe
     * @param {number} radius - The radius of the globe
     * @param {number} width - The width of the globe
     * @param {number} height - The height of the globe
     * @param {number} strokeWidth - The stroke width of the globe
     * @param {string} strokeColor - The stroke color of the globe
     */
    static createGlobe(
        container,
        {
            radius,
            width,
            height,
            strokeWidth,
            strokeColor,
            circleColor,
            circleRadius,
            circleStrokeColor,
            circleStrokeWidth,
            dotsPosition
        }
    ) {
        /* Add default value */
        width = width || 200;
        height = height || 200;
        strokeWidth = strokeWidth || 2;
        strokeColor = strokeColor || "#000";
        // Clear the container
        container.innerHTML = "";
        radius = radius || Math.min(width, height) / 2 - strokeWidth;
        circleColor = circleColor || "#03E0B1";
        circleRadius = circleRadius || 10;
        circleStrokeColor = circleStrokeColor || "#03E0B1";
        circleStrokeWidth = circleStrokeWidth || 2;

        const northPole = [0, 90];
        const specificIntersections = dotsPosition || [];

        // [
        //     { lat: 60, lng: -40 },
        //     { lat: 45, lng: 20 },
        //     { lat: 30, lng: 0 },
        //     { lat: 15, lng: 40 },
        //     { lat: 15, lng: -60 },
        // ]

        const tolerance = 0.5; // tolerance in degrees

        // Create the SVG element
        const svg = d3
            .select(container)
            .append("svg")
            .attr("width", width - strokeWidth)
            .attr("height", height / 2)
            .attr("viewBox", `0 0 ${width} ${height / 2}`);

        // Create a group for the globe
        const globeGroup = svg
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        globeGroup
            .append("defs")
            .append("clipPath")
            .attr("id", "globe-clip")
            .append("circle")
            .attr("r", radius);

        // Create the globe wireframe
        const globeWireframe = globeGroup
            .append("g")
            .attr("class", "globe-wireframe")
            .attr("clip-path", "url(#globe-clip)");

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([0, 0])
            .clipAngle(90)
            .precision(0.5);

        const wireframe = d3.geoPath().projection(projection);

        const graticule = d3
            .geoGraticule()
            .step([30, 15])
            .extent([
                [-180, -90],
                [180, 90],
            ]);

        globeWireframe
            .append("path")
            .datum({ type: "Sphere" })
            .attr("class", "globe-outline")
            .attr("d", wireframe)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", strokeWidth);

        globeWireframe
            .append("path")
            .datum(graticule())
            .attr("class", "graticule")
            .attr("d", wireframe)
            .attr("fill", "none")
            .attr("stroke", (d, i) => {
                console.log('d', d, i);
                return strokeColor;
            })
            .attr("stroke-width", strokeWidth);

        globeWireframe
            .append("circle")
            .attr("transform", `translate(${projection(northPole)})`)
            .attr("r", 4)
            .attr("fill", circleColor)
            .attr("stroke", circleStrokeColor)
            .attr("stroke-width", 1)
            .attr("opacity", 0.8);

        // add circles to where the lines intersect
        const circleData = graticule
            .lines()
            .map((line) => {
                return line.coordinates.map((coord) => {
                    return {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: coord },
                    };
                });
            })
            .flat();

        const circleGroup = globeWireframe
            .append("g")
            .attr("class", "circle-group");

        this.addAnimations(container);

        const pointGroups = circleGroup
            .selectAll("g.point-group")
            .data(
                circleData.filter((d) => {
                    const [lng, lat] = d.geometry.coordinates;
                    return specificIntersections.some(
                        (point) =>
                            Math.abs(lat - point.lat) < tolerance &&
                            Math.abs(lng - point.lng) < tolerance
                    );
                })
            )
            .enter()
            .append("g")
            .attr("class", (d, i) => `point-group point-group-${i + 1}`)
            .attr("transform", (d) => {
                const point = projection(d.geometry.coordinates);
                return point ? `translate(${point[0]}, ${point[1]})` : null;
            });

        pointGroups.each(function (d, i) {
            const coordinates = d.geometry.coordinates;
            if (coordinates) {
                // Create a GeoJSON LineString feature for a great-circle arc
                const arcFeature = {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            northPole, // Start at north pole
                            coordinates, // End at target point
                        ],
                    },
                };

                // Create a path that follows the globe's curvature
                globeWireframe
                    .append("path")
                    .datum(arcFeature)
                    .attr("d", wireframe)
                    .attr("class", `animated-line animated-line-${i + 1}`)
                    .attr("stroke-dasharray", function () {
                        return this.getTotalLength(); // Get actual path length
                    })
                    .attr("stroke-dashoffset", function () {
                        return this.getTotalLength(); // Initial offset equal to length
                    });
            }
        });

        pointGroups
            .append("circle")
            .attr("class", "circle-static")
            .attr("r", circleRadius)
            .attr("fill", circleColor)
            .attr("stroke", circleStrokeColor)
            .attr("stroke-width", circleStrokeWidth);

        for (let i = 0; i < 3; i++) {
            pointGroups
                .append("circle")
                .attr("class", "wave-ring")
                .attr("r", circleRadius)
                .attr("stroke-width", circleStrokeWidth);
        }
    }
}