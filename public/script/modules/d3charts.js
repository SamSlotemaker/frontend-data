export function createBarChart(array, x, y) {
    const container = document.querySelector('#svg-container')
    //grootte van de container
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight

    //selecteer de container, en voeg een svg toe die even groot is (-100px)
    const svg = d3.select('#svg-container')
        .append("svg").attr("width", containerWidth - 100).attr("height", containerHeight - 100);
    //grootte van svg
    const width = svg.attr('width')
    const height = svg.attr('height')

    const margin = {
        top: 50,
        right: 20,
        bottom: 80,
        left: 140
    }

    //bereken maximale lengtes van grafiek
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    //callback functions die loopen over de waardes
    const yValue = d => d[y]
    const xValue = d => d[x]

    //render de chart
    const renderBarChart = data => {
        //maak schaal aan voor assen
        const yScale = d3.scaleLinear()
            .domain([d3.max(data, yValue), 0])
            .range([0, innerHeight])
        const xScale = d3.scaleBand()
            .domain(data.map(xValue))
            .range([0, innerWidth])
            .padding(0.1)

        //creeer groep voor grafiek
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const xAxisTickFormat = number => d3.format('.2s')(number)

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(xAxisTickFormat)
            .tickSize(-innerWidth)
        const xAxis = d3.axisBottom(xScale)

        //voeg groep toe en creer xas label
        const yAxisG = g.append('g')
            .call(yAxis)

        yAxisG.selectAll('.domain').remove()

        yAxisG.append('text')
            .attr('fill', 'white')
            .attr('class', 'axis-label')
            .text('aantal')
            .attr('y', innerHeight / 2)
            .attr('x', -50)
        //voeg groep toe en creer yas label
        const xAxisG = g.append('g')
            .call(xAxis)

        xAxisG
            .attr('transform', `translate(0, ${innerHeight})`)
            .selectAll('.domain, .tick line').remove()

        xAxisG.append('text')
            .attr('y', 50)
            .attr('x', innerWidth / 2)
            .attr('fill', 'white')
            .attr('class', 'axis-label')
            .text('jaar')

        //selecteer alle rectangles in parent element 'g'
        g.selectAll('rect')
            .data(data)
            .enter().append('rect') //voeg rectangles toe wanneer deze niet bestaan
            .attr('x', d => xScale(xValue(d))) //y attribute wordt geset voor ieter item
            // width wordt geset voor ieder item
            .attr("y", d => yScale(yValue(d)))
            .attr('height', d => innerHeight - yScale(yValue(d)))
            .attr('width', xScale.bandwidth()) //height wordt betpaald en geset voor ieder item
        g.append('text')
            .attr('y', -20)
            .text('Aantal toegevoegde parkeerautomaten per jaar')
    }
    renderBarChart(array)
}