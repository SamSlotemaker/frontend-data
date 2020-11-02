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
        top: 0,
        right: 20,
        bottom: 20,
        left: 50
    }

    //bereken maximale lengtes van grafiek
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    //callback functions die loopen over de waardes
    const yValue = d => d[x]
    const xValue = d => d[y]

    //render de chart
    const renderBarChart = data => {
        //maak schaal aan voor assen
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, yValue)])
            .range([0, innerHeight])
        const xScale = d3.scaleBand()
            .domain(data.map(xValue))
            .range([0, innerWidth])
            .padding(0.1)

        //creeer groep voor grafiek
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        //voeg groep toe en creer xas label
        g.append('g').call(d3.axisLeft(yScale))
        //voeg groep toe en creer yas label
        g.append('g').call(d3.axisBottom(xScale))
            .attr('transform', `translate(0, ${innerHeight})`)
        //selecteer alle rectangles in parent element 'g'
        g.selectAll('rect').data(data)
            .enter().append('rect') //voeg rectangles toe wanneer deze niet bestaan
            .attr('x', d => xScale(xValue(d))) //y attribute wordt geset voor ieter item
            .attr("y", d => innerHeight - yScale(yValue(d)))
            .attr('height', d => yScale(yValue(d))) // width wordt geset voor ieder item
            .attr('width', xScale.bandwidth()) //height wordt betpaald en geset voor ieder item

    }
    renderBarChart(array)
}