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
    fillPricePerHour(tariefDeelArray)

    function fillPricePerHour(array) {
        array.forEach(item => {
            item.uurPrijs = calculations.calculatePricePerHour(item.amountfarepart, item.stepsizefarepart)
        })
    }

    joinObjects(tariefDeelArray, verkoopPuntenArray, 'areamanagerid', 'areamanagerid', 'uurPrijs', 'uurPrijs')


    //vul verkooppunten objects met uurprijs gecombineerd op areamanagegrid

    //voeg steden toe aan rdw locaties
    verkoopPuntenArray.forEach(item => {
        batchData.forEach(location => {
            if (location.latitude == item.location.latitude && location.longitude == item.location.longitude) {
                item.city = location.city
            }
        })
    })



    function joinObjects(array1, array2, columnNameKey1, columnNameKey2, columnResult1, columnResult2) {
        array1.forEach((item) => {
            array2.forEach(verkooppunt => {
                if (verkooppunt[columnNameKey1] == item[columnNameKey2]) {
                    verkooppunt[columnResult1] = item[columnResult2]
                }
            })
        })
    }

    //gemiddelde uurprijs per stad
    const averageInCity = calculations.calculateAverageInArrayOfObjects(verkoopPuntenArray, 'uurPrijs')
    //gemiddelde groei per stad
    const growthPerCity = calculations.calculateAverageGrowthPerCity(verkoopPuntenArray)

    //vul verkooppunten met beide gemiddelden

    verkoopPuntenArray.forEach(verkooppunt => {
        averageInCity.forEach(gemiddelde => {
            if (verkooppunt.city == gemiddelde.id) {
                verkooppunt.gemiddeldeUurPrijs = gemiddelde.gemiddelde
            }
        })
        growthPerCity.forEach(groei => {
            if (verkooppunt.city == groei.city) {
                verkooppunt.gemiddeldeGroeiPerJaar = groei.groeiPerJaar
            }
        })
    })

    const scatterPlotData = arrayManipulations.filterArrayThreeColumns(verkoopPuntenArray, 'city', 'gemiddeldeUurPrijs', 'gemiddeldeGroeiPerJaar')
    console.log(scatterPlotData)


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