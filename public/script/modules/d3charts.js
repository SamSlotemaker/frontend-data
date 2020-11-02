export function createBarChart(array, x, y) {
    const container = document.querySelector('#svg-container')
    //grootte van de container
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight

    //selecteer de container, en voeg een svg toe die even groot is (-100px)
    const svg = d3.select('#svg-container')
        .append("svg").attr("width", containerWidth - 100).attr("height", containerHeight - 100);
    //grootte van svg
    const width = +svg.attr('width')
    const height = +svg.attr('height')

    //callback functions die loopen over de waardes
    const xValue = d => d[x]
    const yValue = d => d[y]

    const margin = {
        top: 0,
        right: 20,
        bottom: 20,
        left: 50
    }

    //bereken maximale lengtes van grafiek
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    //render de chart
    const renderBarChart = data => {
        //maak schaal aan voor assen
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth])
        const yScale = d3.scaleBand()
            .domain(data.map(yValue))
            .range([0, innerHeight])
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
            .attr('y', d => yScale(yValue(d))) //y attribute wordt geset voor ieter item
            .attr('width', d => xScale(xValue(d))) // width wordt geset voor ieder item
            .attr('height', yScale.bandwidth()) //height wordt betpaald en geset voor ieder item

    }
    renderBarChart(array)
}