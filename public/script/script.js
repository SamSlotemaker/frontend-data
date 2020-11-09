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
const tariefdeelURL = 'https://opendata.rdw.nl/resource/534e-5vdg.json?$limit=10000'


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

    //vul tariefobjecten met uurprijs
    tariefDeelArray.forEach(item => {
        item.uurPrijs = calculations.calculatePricePerHour(item.amountfarepart, item.stepsizefarepart)
    })

    //vul verkooppunten objects met uurprijs gecombineerd op areamanagegrid
    tariefDeelArray.forEach((item, ) => {
        verkoopPuntenArray.forEach(verkooppunt => {
            if (verkooppunt.areamanagerid == item.areamanagerid) {
                verkooppunt.uurPrijs = item.uurPrijs
            }
        })
    })

    //totaal per stad
    const totaalCity = calculations.countItemsinArray(verkoopPuntenArray)

    //filter lege uurprijzen
    const gefilterdeUurprijs = verkoopPuntenArray.filter(item => {
        if (item.uurPrijs) {
            return item;
        }
    })



    //voeg steden toe aan rdw locaties
    verkoopPuntenArray.forEach(item => {
        batchData.forEach(location => {
            if (location.latitude == item.location.latitude && location.longitude == item.location.longitude) {
                item.city = location.city
            }
        })
    })

    //gemiddelde uurprijs per stad
    const averageInCity = calculations.calculateAverageInArrayOfObjects(verkoopPuntenArray, 'uurPrijs')

    //gemiddelde groei per stad
    const growthPerCity = calculations.calculateAverageGrowthPerCity(verkoopPuntenArray)

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
    const pricePerHour = calculations.calculatePricePerHourArray(amountPerStep, stepSizeInMinutes)
    //sort price per hour from large to small
    const sortedPricePerHour = arrayManipulations.sortArrayLargeToSmall(pricePerHour)

    //refactor date strings to objects
    const refactoredSellingPointDates = cleanData.refactorDates(sellingPointDate)

    const sellingPointYears = refactoredSellingPointDates.map(date => date.year)
    //tel hoe vaak ieder jaar voorkomt
    const countedYears = calculations.countItemsinArray(sellingPointYears)
    //sorteer getelde lijst van groot naar klein op aantal
    const countedYearsSorted = arrayManipulations.sortArrayLargeToSmall(countedYears, 'aantal')
    //sorteer getelde lijst van groot naar klein op jaartal
    const countedYearsSortedByYears = arrayManipulations.sortArraySmallToLarge(countedYears, 'id')

    const plaatsNamen = batchData.map(item => item.city)
    const countPlaatsnamen = calculations.countItemsinArray(plaatsNamen)


    const testObject = []
    //maak random test object
    for (let i = 0; i < 200; i++) {
        testObject.push({
            vermogen: Math.floor(Math.random() * 200 + 1),
            groei: Math.floor(Math.random() * 40 + 1)
        })
    }

    /*********************************/
    /***************D3****************/
    /*********************************/
    scatterPlot.createScatterPlot(testObject, 'groei', 'vermogen')
})

//returns promise with data from given url
export function getData(url) {
    return fetch(url)
}