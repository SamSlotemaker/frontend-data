const container = document.querySelector('#svg-container')
//grootte van de container
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight

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


export function createScatterPlot(array, x, y) {



    //callback functions die loopen over de waardes
    const xValue = d => d[x]
    const yValue = d => d[y]


    //render de chart
    const renderBarChart = data => {

        var zoom = d3.zoom()
            .scaleExtent([.5, 20])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed);

        //maak schaal aan voor assen
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, xValue))
            .range([0, innerWidth])
            .nice()
        const yScale = d3.scaleLinear()
            .domain([d3.max(data, yValue), d3.min(data, yValue)])
            .range([0, innerHeight])
            .nice()

        //creeer groep voor grafiek
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const xAxisTickFormat = number => d3.format('')(number)

        //creer as an onderkant
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(xAxisTickFormat)
            .tickSize(-innerHeight)
            .tickPadding(15)

        //creer as an zijkant
        const yAxis = d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickPadding(15)

        //voeg groep toe en creer xas label
        const yAxisG = g.append('g')
            .call(yAxis)
        yAxisG.selectAll('.domain').remove()

        //toevoegen van label aan Y-as
        yAxisG.append('text')
            .attr('fill', 'white')
            .attr('class', 'axis-label')
            .attr('transform', `rotate(-90)`)
            .text(y)
            .attr('y', -50)
            .attr('x', -innerHeight / 2)
            .attr('text-anchor', 'middle')

        //voeg groep toe en creer yas label
        const xAxisG = g.append('g')
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
            .text(x)



        //selecteer alle rectangles in parent element 'g'
        var points = g.selectAll('circle')
            .data(data)
        points
            .enter().append('circle') //voeg rectangles toe wanneer deze niet bestaan
            .attr('cy', d => yScale(yValue(d))) //y attribute wordt geset voor ieter item
            .attr('cx', d => xScale(xValue(d))) //height wordt betpaald en geset voor ieder item
            .attr('r', circleRadius)
            .on('mouseover', mouseOverEvent)
            .on('mouseout', mouseOutEvent)
        g.append('text')
            .attr('y', -40)
            .text(graphTitle)


        svg.call(zoom);


        function zoomed(e) {
            console.log('zooom')
            // create new scale ojects based on event
            var new_xScale = e.transform.rescaleX(xScale);
            var new_yScale = e.transform.rescaleY(yScale);
            // update axes
            xAxisG.call(xAxis.scale(new_xScale));
            yAxisG.call(yAxis.scale(new_yScale));
            //update points
            points.data(data)
                .attr('cx', function (d) {
                    return new_xScale(xValue(d))
                })
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
            d3.select("#t" + id).remove() //verwijder toegevoegd label
        }
    }
    renderBarChart(array)
}