import * as arrayManipulations from './modules/arrayManipulations.js'
import * as calculations from './modules/calculations.js'
import * as cleanData from './modules/cleanData.js'
import * as barChart from './modules/d3/barChart.js'
import * as scatterPlot from './modules/d3/scatterPlot.js'
import * as reverseGeo from './modules/reverseGeo.js'
import {
    batchData
} from '../../data/placenameByGeo.js'
import {
    vermogenPerGemeente
} from '../../data/vermogen-gemeentes.js'

//schoon stadsnamen op
const vermogenPerGemeenteClean = cleanVermogenInfo(vermogenPerGemeente)
console.log(vermogenPerGemeenteClean)

// API URL variabelen
const geoVerkoopPuntenURL = 'https://opendata.rdw.nl/resource/cgqw-pfbp.json?$limit=100000&$offset=0'
const tariefdeelURL = 'https://opendata.rdw.nl/resource/534e-5vdg.json?$limit=10000'

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
    //voeg uurprijs toe aan verkooppunten gejoind met areamanagerid
    joinObjects(tariefDeelArray, verkoopPuntenArray, 'areamanagerid', 'areamanagerid', 'uurPrijs', 'uurPrijs')
    //voeg steden toe aan rdw locaties
    fillCities(verkoopPuntenArray, batchData)
    //gemiddelde uurprijs per stad
    const averageInCity = calculations.calculateAverageInArrayOfObjects(verkoopPuntenArray, 'uurPrijs')
    //gemiddelde groei per stad
    const growthPerCity = calculations.calculateAverageGrowthPerCity(verkoopPuntenArray)
    //vul verkooppunten met beide gemiddelden
    fillSellingpointsWithAverages(verkoopPuntenArray, averageInCity, growthPerCity)
    //filter verkooppunten op benodigde data
    const scatterPlotData = arrayManipulations.filterArrayThreeColumns(verkoopPuntenArray, 'city', 'gemiddeldeUurPrijs', 'gemiddeldeGroeiPerJaar')
    //verkrijg alle unieke steden
    const uniqueScatterPlotData = arrayManipulations.uniqueArrayOfObjects(scatterPlotData, 'city')
    //vul een lege array met een object per unieke stad
    const useScatterPlotData = formatScatterPlotData(uniqueScatterPlotData, scatterPlotData, vermogenPerGemeenteClean)
    //create scatterplot in dom
    scatterPlot.createScatterPlot(useScatterPlotData, 'gemiddeldeGroeiPerJaar', 'gemiddeldeUurPrijs')
    // scatterPlot.createScatterPlot(useScatterPlotData, 'gemiddeldeGroeiPerJaar', 'vermogen')
    // scatterPlot.createScatterPlot(useScatterPlotData, 'vermogen', 'gemiddeldeUurPrijs')

})

/*********************************/
/***************FUNCTIONS*********/
/*********************************/

//returns promise with data from given url
export function getData(url) {
    return fetch(url)
}

//bereken price per hour in de meegegeven array en vul deze met resultaat
function fillPricePerHour(array) {
    array.forEach(item => {
        item.uurPrijs = calculations.calculatePricePerHour(item.amountfarepart, item.stepsizefarepart)
    })
}

function cleanVermogenInfo(vermogenPerGemeente) {
    let vermogenPerGemeente2 = vermogenPerGemeente.map(item => {
        let gemeente = item.gemeente
        //vervang haakjes in plaatsnamen
        let gemeenteGeenHaakjes = gemeente.replace(/\(.*?\)/, "")
        //vervang spatie op het einde van sommige woorden door het vervangen van haakjes
        const lastLetter = gemeenteGeenHaakjes.slice(-1)
        if (lastLetter == ' ') {
            gemeenteGeenHaakjes = gemeenteGeenHaakjes.substr(0, gemeenteGeenHaakjes.length - 1)
        }

        let vermogen = item.vermogen
        vermogen = vermogen.replace(',', '.')
        vermogen = parseFloat(vermogen)
        if (vermogen) {
            return {
                gemeente: gemeenteGeenHaakjes,
                vermogen: vermogen
            }
        } else {
            return {
                gemeente: gemeenteGeenHaakjes,
                vermogen: 0
            }
        }
    })
    return vermogenPerGemeente2
}

//vul steden doormidden van het checken van lat- en longitude
function fillCities(array1, array2) {
    array1.forEach(item => {
        array2.forEach(location => {
            if (location.latitude == item.location.latitude && location.longitude == item.location.longitude) {
                item.city = location.city
            }
        })
    })
}

//vull verkooppunten met gemiddeldes van andere objecten, stad is hierin de key
function fillSellingpointsWithAverages(array1, array2, array3) {
    array1.forEach(verkooppunt => {
        array2.forEach(gemiddelde => {
            if (verkooppunt.city == gemiddelde.id) {
                verkooppunt.gemiddeldeUurPrijs = gemiddelde.gemiddelde
            }
        })
        array3.forEach(groei => {
            if (verkooppunt.city == groei.city) {
                verkooppunt.gemiddeldeGroeiPerJaar = groei.groeiPerJaar
            }
        })
    })

}

//join twee objecten doormiddel van meegegeven keys en vul de meegegeven proprties
function joinObjects(array1, array2, columnNameKey1, columnNameKey2, columnResult1, columnResult2) {
    array1.forEach((item) => {
        array2.forEach(verkooppunt => {
            if (verkooppunt[columnNameKey1] == item[columnNameKey2]) {
                verkooppunt[columnResult1] = item[columnResult2]
            }
        })
    })
}

function formatScatterPlotData(uniqueScatterPlotData, scatterPlotData, vermogenPerGemeenteClean) {
    const scatterPlotArray = []
    uniqueScatterPlotData.forEach(item => {
        if (item) {
            scatterPlotArray.push({
                city: item
            })
        }
    })

    //check voor elk verkooppunt of de stad bestaat in de array van objecten  
    //zo ja, vul deze met de gemiddeldes
    scatterPlotArray.forEach(item => {
        scatterPlotData.forEach(item2 => {
            if (item.city == item2.city) {
                item.gemiddeldeUurPrijs = item2.gemiddeldeUurPrijs
                item.gemiddeldeGroeiPerJaar = item2.gemiddeldeGroeiPerJaar
            }
        })
        vermogenPerGemeenteClean.forEach(vermogenInfo => {
            if (item.city == vermogenInfo.gemeente) {
                item.vermogen = vermogenInfo.vermogen
            }
        })
    })
    //wanneer vermogen niet bekend is, zet deze op 0
    scatterPlotArray.forEach(item => {
        if (!item.hasOwnProperty('vermogen')) {
            item.vermogen = 0;
        }
    })
    return scatterPlotArray
}