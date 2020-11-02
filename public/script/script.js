import * as arrayManipulations from './modules/arrayManipulations.js'
import * as calculations from './modules/calculations.js'
import * as cleanData from './modules/cleanData.js'
import * as d3Charts from './modules/d3charts.js'

// API URL variabelen
const geoVerkoopPuntenURL = 'https://opendata.rdw.nl/resource/cgqw-pfbp.json?$limit=15000'
const tariefdeelURL = 'https://opendata.rdw.nl/resource/534e-5vdg.json?$limit=100'

// Kolomnaam variabelen
const columnLocation = 'location'
const columnStartDateSellingpoint = 'startdatesellingpoint'
const columnStepSizeFarePart = 'stepsizefarepart'
const columnAmountFarePart = 'amountfarepart'

//ophalen sorteer buttons
const buttonJaar = document.querySelector('#svg-container > div > div button:first-of-type')
const buttonAantal = document.querySelector('#svg-container > div > div button:last-of-type')


//ophalen data
const verkoopPunten = getData(geoVerkoopPuntenURL);
const tariefDeel = getData(tariefdeelURL)

//wacht tot alle data is opgehaald, vertaal de data vervolgens naar json
const allPromises = Promise.all([verkoopPunten, tariefDeel]).then(res => {
    const responses = res.map(response => response.json())
    return Promise.all(responses)
})
//wanneer data vertaald is naar json:
allPromises.then(data => {

        //ophalen arrays uit de data
        const verkoopPuntenArray = data[0]; //array met verkooppunten
        const tariefDeelArray = data[1] //array met prijs informatie

        // filter arrays on columns
        //verkooppunten
        const sellingPointLocations = arrayManipulations.filterArray(verkoopPuntenArray, columnLocation)
        //start verkoopdatum
        const sellingPointDate = arrayManipulations.filterArray(verkoopPuntenArray, columnStartDateSellingpoint)
        //prijs per stap
        const amountPerStep = arrayManipulations.filterArray(tariefDeelArray, columnAmountFarePart)
        //grootte van stap in minuten
        const stepSizeInMinutes = arrayManipulations.filterArray(tariefDeelArray, columnStepSizeFarePart)

        //calculate price per hour for sellingpoints
        const pricePerHour = calculations.calculatePricePerHour(amountPerStep, stepSizeInMinutes)
        //sort price per hour from large to small
        const sortedPricePerHour = arrayManipulations.sortArrayLargeToSmall(pricePerHour)

        //refactor date strings to objects
        const refactoredSellingPointDates = cleanData.refactorDates(sellingPointDate)

        //haal alle jaren op 
        const sellingPointYears = refactoredSellingPointDates.map(date => date.year)

        //tel hoe vaak ieder jaar voorkomt
        const countedYears = calculations.countItemsinArray(sellingPointYears)

        //sorteer getelde lijst van groot naar klein op aantal
        const countedYearsSorted = arrayManipulations.sortArrayLargeToSmall(countedYears, 'aantal')

        //sorteer getelde lijst van groot naar klein op jaartal
        const countedYearsSortedByYears = arrayManipulations.sortArrayLargeToSmall(countedYears, 'jaar')

        /*********************************/
        /***************D3****************/
        /*********************************/

        //maak bar chart met meegegeven x en y axis 
        function ceateChartAantal(e) {
            removeSVG() //verwijder vorige grafiek wanneer deze bestond
            if (e.target.textContent == 'Aantal') {
                d3Charts.createBarChart(countedYearsSorted, 'aantal', 'jaar')
            } else {
                d3Charts.createBarChart(countedYearsSortedByYears, 'aantal', 'jaar')
            }
        }
        //kies sorteer optie doormiddel van knoppen
        buttonJaar.addEventListener('click', ceateChartAantal)
        buttonAantal.addEventListener('click', ceateChartAantal)
    })
    .catch(err =>
        console.log('oooooops:', err))

//returns promise with data from given url
function getData(url) {
    return fetch(url)
}

//verwijder een bestaande grafiek op de pagina wanneer deze bestaat
function removeSVG() {
    let SVG = document.querySelector('svg')
    if (SVG) {
        SVG.remove();
    }
}


//test ophalen stad uit geodata
// let lat = "52.654419"
// let lon = "4.802728"
// let reverseGeoURL = 'https://api.geoapify.com/v1/geocode/reverse?lat=' + lat + '&lon=' + lon + '&lang=en&limit=1&apiKey=3f7178ec150147b68f8f7517b79b7ebe'
// getData(reverseGeoURL)
//     .then(result => {
//         return result.json()
//     })
//     .then(data => {
//         const city = data.features[0].properties.city
//         console.log(city)
//     })