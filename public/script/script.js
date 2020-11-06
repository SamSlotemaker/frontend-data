import * as arrayManipulations from './modules/arrayManipulations.js'
import * as calculations from './modules/calculations.js'
import * as cleanData from './modules/cleanData.js'
import * as barChart from './modules/d3/barChart.js'
import * as scatterPlot from './modules/d3/scatterPlot.js'
import * as reverseGeo from './modules/reverseGeo.js'
import {
    batchData
} from '../../data/placenameByGeo.js'


// API URL variabelen
const geoVerkoopPuntenURL = 'https://opendata.rdw.nl/resource/cgqw-pfbp.json?$limit=100000&$offset=0'
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

    //refactor dates to JS date objects and filter empty dates
    const sellingPointDatesFormattedAmerican = refactoredSellingPointDates.map(date => {
        if (date != -1) {
            const factoredDate = `${date.year}-${date.month}-${date.day}`
            return new Date(factoredDate)
        } else {
            console.log(date)
            return -1
        }
    }).filter(date => date != -1)

    const sellingPointDatesFormattedAmericanSorted = arrayManipulations.sortArraySmallToLarge(sellingPointDatesFormattedAmerican)

    let count = 0;
    const totalOverDates = sellingPointDatesFormattedAmericanSorted.map(date => {
        count++
        return {
            date: date,
            amount: count
        }
    })
    const newResultArray = []
    totalOverDates.forEach((date) => {
        if (newResultArray.indexOf(date) == -1) {
            newResultArray.push(date)
        }
    })

    console.log(newResultArray)

    console.log(totalOverDates)

    const sellingPointYears = refactoredSellingPointDates.map(date => date.year)
    //tel hoe vaak ieder jaar voorkomt
    const countedYears = calculations.countItemsinArray(sellingPointYears)
    //sorteer getelde lijst van groot naar klein op aantal
    const countedYearsSorted = arrayManipulations.sortArrayLargeToSmall(countedYears, 'aantal')
    //sorteer getelde lijst van groot naar klein op jaartal
    const countedYearsSortedByYears = arrayManipulations.sortArraySmallToLarge(countedYears, 'id')


    const plaatsNamen = batchData.map(item => item.city)
    const countPlaatsnamen = calculations.countItemsinArray(plaatsNamen)
    console.log(countedYearsSorted)


    const testObject = []
    //maak random test object
    for (let i = 0; i < 200; i++) {
        testObject.push({
            vermogen: Math.floor(Math.random() * 200 + 1),
            groei: Math.floor(Math.random() * 40 + 1)
        })
    }
    const sortedTestObject = arrayManipulations.sortArraySmallToLarge(testObject, 'groei')
    console.log(sortedTestObject)

    /*********************************/
    /***************D3****************/
    /*********************************/
    scatterPlot.createScatterPlot(testObject, 'vermogen', 'groei')


    // barChart.createBarChart(countedYearsSorted, 'id', 'aantal')
    //maak bar chart met meegegeven x en y axis 
    //     function ceateChartAantal(e) {
    //         removeSVG() //verwijder vorige grafiek wanneer deze bestond
    //         if (e.target.textContent == 'Aantal') {
    //             barChart.createBarChart(countedYearsSorted, 'id', 'aantal')
    //         } else {
    //             barChart.createBarChart(countedYearsSortedByYears, 'id', 'aantal')
    //         }
    //     }
    //     //kies sorteer optie doormiddel van knoppen
    //     buttonJaar.addEventListener('click', ceateChartAantal);
    //     buttonAantal.addEventListener('click', ceateChartAantal)
})

//returns promise with data from given url
export function getData(url) {
    return fetch(url)
}

//verwijder een bestaande grafiek op de pagina wanneer deze bestaat
function removeSVG() {
    let SVG = document.querySelector('svg')
    if (SVG) {
        SVG.remove();
    }
}
//downloads file
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {
        type: contentType
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// //maak array in het juiste format voor API
// const nieuweVerkoopArray = verkoopPuntenArray.map((punt, index) => {
//     const object = {
//         id: index,
//         params: {
//             lat: punt.location.latitude,
//             lon: punt.location.longitude
//         }
//     }
//     return object
// })

// var useApiData = {
//     "api": "/v1/geocode/reverse",
//     "params": {
//         "lang": "nl",
//     },
//     "inputs": nieuweVerkoopArray
// };

// reverseGeo.batchGeo(useApiData).then(data => {
//     return JSON.stringify(data)
// }).then(data => {
//     // console.log(data)
//     download(data, 'json.txt', 'text/plain');
// })