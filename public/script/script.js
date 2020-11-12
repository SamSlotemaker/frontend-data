import * as arrayManipulations from './modules/arrayManipulations.js'
import * as calculations from './modules/calculations.js'
import * as cleanData from './modules/cleanData.js'
import * as barChart from './modules/d3/barChart.js'
import * as scatterPlot from './modules/d3/scatterPlot.js'
import * as reverseGeo from './modules/reverseGeo.js'
import {
    batchData
} from '../data/placenameByGeo.js'
import {
    vermogenPerGemeente
} from '../data/vermogen-gemeentes.js'
import {
    fillPricePerHour,
    cleanVermogenInfo,
    fillCities,
    fillSellingpointsWithAverages,
    joinObjects,
    formatScatterPlotData
} from './modules/formatData.js'


// API URL variabelen
const geoVerkoopPuntenURL = 'https://opendata.rdw.nl/resource/cgqw-pfbp.json?$limit=100000&$offset=0'
const tariefdeelURL = 'https://opendata.rdw.nl/resource/534e-5vdg.json?$limit=10000'

//ophalen data
const verkoopPunten = getData(geoVerkoopPuntenURL);
const tariefDeel = getData(tariefdeelURL)

//kolomnamen
const areamanageridKolom = 'areamanagerid'
const uurPrijsKolom = 'uurPrijs'
const gemiddeldeUurPrijsKolom = 'gemiddeldeUurPrijs'
const gemiddeldeGroeiPerJaarKolom = 'gemiddeldeGroeiPerJaar'
const cityKolom = 'city'

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

    //schoon stadsnamen op
    const vermogenPerGemeenteClean = cleanVermogenInfo(vermogenPerGemeente)
    //vul tariefobjecten met uurprijs
    fillPricePerHour(tariefDeelArray)
    //voeg uurprijs toe aan verkooppunten gejoind met areamanagerid
    joinObjects(tariefDeelArray, verkoopPuntenArray, areamanageridKolom, areamanageridKolom, uurPrijsKolom, uurPrijsKolom)
    //voeg steden toe aan rdw locaties
    fillCities(verkoopPuntenArray, batchData)
    //gemiddelde uurprijs per stad
    const averageInCity = calculations.calculateAverageInArrayOfObjects(verkoopPuntenArray, uurPrijsKolom)
    //gemiddelde groei per stad
    const growthPerCity = calculations.calculateAverageGrowthPerCity(verkoopPuntenArray)
    //vul verkooppunten met beide gemiddelden
    fillSellingpointsWithAverages(verkoopPuntenArray, averageInCity, growthPerCity)
    //filter verkooppunten op benodigde data
    const scatterPlotData = arrayManipulations.filterArrayThreeColumns(verkoopPuntenArray, cityKolom, gemiddeldeUurPrijsKolom, gemiddeldeGroeiPerJaarKolom)
    //verkrijg alle unieke steden
    const uniqueScatterPlotData = arrayManipulations.uniqueArrayOfObjects(scatterPlotData, cityKolom)
    //vul een lege array met een object per unieke stad
    const useScatterPlotData = formatScatterPlotData(uniqueScatterPlotData, scatterPlotData, vermogenPerGemeenteClean)
    //verwijder laadscherm wanneer berekeningen klaar zijn
    document.querySelector('.loading').classList.add('hidden')
    //create scatterplot in dom
    scatterPlot.createScatterPlot(useScatterPlotData, gemiddeldeGroeiPerJaarKolom, gemiddeldeUurPrijsKolom)
})

//returns promise with data from given url
export function getData(url) {
    return fetch(url)
}