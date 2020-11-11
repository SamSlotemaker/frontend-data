const container = document.querySelector('#svg-container')
//grootte van de container
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight

//globale variabelen voor functies
let xScale;
let yScale;
let xAxis;
let yAxis;
let yAxisG;
let xAxisG;

//selecteer de container, en voeg een svg toe die even groot is (-100px)
const svg = d3.select('#svg-container')
    .append("svg").attr("width", containerWidth - 100).attr("height", containerHeight - 100);

//standard variables
const width = svg.attr('width')
const height = svg.attr('height')
const circleRadius = 10
const graphTitle = 'Vermogen ten opzichten van groei in parkeer automaten'
const margin = {
    top: 70,
    right: 20,
    bottom: 80,
    left: 140
}

//bereken maximale lengtes van grafiek
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom

//cip path maken zodat bolletjes niet buiten de assen komen
svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

export function createScatterPlot(array, x, y) {
    let yVar = y
    let xVar = x

    //callback functions die loopen over de waardes
    const xValue = d => d[xVar]
    const yValue = d => d[yVar]

    //render de chart
    const renderBarChart = data => {
        var zoom = d3.zoom()
            .scaleExtent([1, 20])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed)

        //haal propertynames uit de data voor de filteropties
        let propertyNames = Object.getOwnPropertyNames(data[0])
        let propertyNamesWithoutCity = propertyNames.slice(1, 4)
        let yFields = propertyNamesWithoutCity
        //call zoom op de parent svg voor de zoom functionaliteit
        svg.call(zoom);


        //creeer groep voor grafiek
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        //title toevoegen
        g.append('text')
            .attr('y', -40)
            .text(graphTitle)

        //initiele setup
        setupScales()
        setupInput(yFields)
        setupAxis()

        //creer aparte groep voor de getekende punten met een clip path
        var points_g = g.append("g")
            .attr("clip-path", "url(#clip)")
            .classed("points_g", true);
        var points;
        //roep 1 keer aan bij laden grafiek
        selectionChangedY()

        //initieren van de x- en yScale
        function setupScales() {
            xScale = d3.scaleLinear()
                .domain(d3.extent(data, xValue))
                .range([0, innerWidth])
                .nice()

            yScale = d3.scaleLinear()
                .domain([d3.max(data, yValue), d3.min(data, yValue)])
                .range([0, innerHeight])
                .nice()
        }

        //initieren van de x- en yAxis

        function setupAxis() {
            xAxis = d3.axisBottom(xScale)
                .tickSize(-innerHeight)
                .tickPadding(15)

            //creer as an zijkant
            yAxis = d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickPadding(15)

            //voeg groep toe en creer xas label
            yAxisG = g.append('g')

            //toevoegen van label aan Y-as
            yAxisG.append('text')
                .attr('fill', 'white')
                .attr('class', 'axis-label')
                .attr('transform', `rotate(-90)`)
                .text(yVar)
                .attr('y', -50)
                .attr('x', -innerHeight / 2)
                .attr('text-anchor', 'middle')

            //voeg groep toe en creer yas label
            xAxisG = g.append('g')
                .call(xAxis)
            xAxisG
                .attr('transform', `translate(0, ${innerHeight})`)
                .selectAll('.domain').remove()

            //toevoegen van legenda aan X-as
            xAxisG.append('text')
                .attr('y', 50)
                .attr('x', innerWidth / 2)
                .attr('fill', 'white')
                .attr('class', 'axis-label')
                .text(xVar)
        }

        //wordt aangeroepen wanneer select element veranderd
        function selectionChangedY() {
            //this is the form element, zet naar standaard wanneer er geen change is uitgevoerd (eerste keer)
            yVar = this ? this.value : yVar
            yScale.domain([d3.max(data, yValue), 0]) //nieuw domain maken

            //call nieuwe Y-as
            yAxisG.call(yAxis)
            yAxisG.selectAll('.domain').remove()
            //selecteer alle circles in parent element 'points_g'
            points = points_g.selectAll('circle').data(data)

            //update selection
            points.transition().attr('cy', d => yScale(yValue(d)))

            //enter selection
            points = points.enter().append('circle')
                .on('mouseover', mouseOverEvent)
                .on('mouseout', mouseOutEvent)
                .attr('cy', d => yScale(yValue(d))) //y attribute wordt geset voor ieter item
                .attr('cx', d => xScale(xValue(d))) //x attribute wordt geset voor ieter item
                .attr('r', circleRadius) //circle radius
                .attr('fill', 'white')

            //exit selection
            points.exit().remove()
        }

        //setup input formulier
        function setupInput(yFields, xFields) {
            d3.select('form')
                .append('select')
                .text("Select a text value")
                .on('change', selectionChangedY)
                .selectAll('option')
                .data(yFields)
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => "Y-as: " + d)
                .property("selected", d => d === yVar)
        }

        //zoomed wordt uitgevoerd op het scrollevent
        function zoomed(e) {
            // create new scale ojects based on event
            var new_xScale = e.transform.rescaleX(xScale);
            var new_yScale = e.transform.rescaleY(yScale);
            // update axes
            xAxisG.call(xAxis.scale(new_xScale));
            yAxisG.call(yAxis.scale(new_yScale));
            //update points
            points.data(data)
                .attr('cx', (d) => new_xScale(xValue(d)))
                .attr('cy', function (d) {
                    return new_yScale(yValue(d))
                });
        }

        //mouseover event
        function mouseOverEvent(d, i) {
            //verwijder alle niet letter en numerieke charachters als id's
            let city = i.city;
            let id = city.replace(/[\W_]+/g, "");
            //vergroot circle radius * 2
            d3.select(this).transition().attr('r', circleRadius * 2)
                .attr('fill', 'orangered')
            //voel label toe met id om later te verwijderen
            svg.append('text')
                .attr('id', "t" + id)
                .attr('x', d.pageX - 30)
                .attr('y', d.pageY - 50)
                .text(i.city)
        }

        //mouseout event
        function mouseOutEvent(d, i) {
            //verwijder alle niet letter en numerieke charachters als id's
            let city = i.city;
            let id = city.replace(/[\W_]+/g, "");
            d3.select(this).transition().attr('r', circleRadius) //radius naar normaal
                .attr('fill', 'white')
            d3.select("#t" + id).remove() //verwijder toegevoegd label
        }
    }
    renderBarChart(array)
}