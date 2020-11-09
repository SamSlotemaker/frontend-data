 import {
     uniqueArray
 } from './arrayManipulations.js'

 //returns price per hour, given is a price per step, and time in minutes for the step
 export function calculatePricePerHourArray(stepSize, stepSizeInMinutes) {
     const pricePerHour = [];
     stepSizeInMinutes.forEach((step, index) => {
         pricePerHour.push(stepSize[index] / step * 60)
     })
     return pricePerHour
 }

 export function calculatePricePerHour(stepSize, stepSizeInMinutes) {

     const pricePerHour = stepSize / stepSizeInMinutes * 60
     return pricePerHour
 }

 //counts all items in array
 export function countItemsinArray(array) {
     let allItems = uniqueArray(array) //maak array van alle unieke jaartallen
     let counter = [] //maak counter object dat later gevuld wordt

     //verwijder lege items
     allItems = allItems.filter(item => {
         if (item) {
             return item
         }
     })
     //vol object counter met default value 0 voor elk jaar
     allItems.forEach(item => {
         counter.push({
             "id": item,
             "aantal": 0
         })
     })

     for (let i = 0; i < array.length; ++i) { //loop over volledige array
         for (let j = 0; j < allItems.length; j++) { //loop over unieke jaartallen voor iedere waarde in volledige array
             if (array[i] == allItems[j])
                 counter[j].aantal += 1; //tel 1 op bij het object van het jaartal voor iedere keer dat het jaar gevonden wordt
         }
     }
     return counter;
 }

 //bereken het gemiddelde van het meegegeven value
 export function calculateAverageInArrayOfObjects(array, value) {
     //maak array van alle steden
     let cityArray = array.map(item => {
         if (item.city) {
             return item.city
         }
     })

     let allItems = uniqueArray(cityArray) //maak array van alle unieke jaartallen
     let counter = [] //maak counter object dat later gevuld wordt

     //verwijder lege items
     allItems = allItems.filter(item => {
         if (item) {
             return item
         }
     })

     //vol object counter met default values
     allItems.forEach(item => {
         if (item) {
             counter.push({
                 "id": item,
                 "aantal": 0,
                 "totaal": 0
             })
         }
     })

     //vul objecten aan
     for (let i = 0; i < array.length; ++i) { //loop over volledige array
         for (let j = 0; j < allItems.length; j++) { //loop over unieke jaartallen voor iedere waarde in volledige array
             if (array[i].city == allItems[j]) {
                 counter[j].aantal += 1; //tel 1 op bij het object van het jaartal voor iedere keer dat het jaar gevonden wordt
                 counter[j].totaal += array[i][value]
             }
         }
     }

     //voeg gemiddelde toe per object
     counter.forEach(item => {
         item.gemiddelde = item.totaal / item.aantal
     })

     //return array van getelde objecten
     return counter;
 }


 //bereken het gemiddelde van het meegegeven value
 export function calculateAverageGrowthPerCity(array, value) {
     //maak array van alle steden
     let cityArray = array.map(item => {
         if (item.city) {
             return item.city
         }
     })
     let totalSellingPointsPerCity = countItemsinArray(cityArray)

     //maak objecten met alle jaren per stad
     let arrayCityAndYears = array.map(item => {
         let begindatum;
         let beginJaar;

         //check of de datum niet leeg is
         if (item.startdatesellingpoint) {
             begindatum = item.startdatesellingpoint
             beginJaar = begindatum.substring(0, 4)
         }
         //  wanneer beide waardes bestaan, voeg deze toe aan het object
         let newObject = {}
         if (item.city && beginJaar) {
             newObject = {
                 city: item.city,
                 jaar: +beginJaar
             }
         }
         return newObject
     })

     //bereken het verschil in jaren per stad

     //maak een array met alle jaren per stad waarin een automaat is toegevoegd
     const allYearsPerCity = []
     totalSellingPointsPerCity.map(sellingpoint => {
         let emptyArray = []
         arrayCityAndYears.forEach(item => {
             if (item.city == sellingpoint.id) {
                 emptyArray.push(item.jaar)
             }
         })
         allYearsPerCity.push({
             stad: sellingpoint.id,
             jaren: emptyArray
         })
     })


     //bereken het verschil tussen de jaren
     allYearsPerCity.forEach(item => {
         //bereken laagste en hoogste jaartal
         let min = Math.min(...item.jaren)
         let max = Math.max(...item.jaren)

         //bereken verschil tussen beide
         let difference = max - min
         item.jarenVerschil = difference + 1
         item.groeiPerJaar = item.jaren.length / item.jarenVerschil
     })
     const filteredGrowth = allYearsPerCity.map(item => {
         return {
             city: item.stad,
             groeiPerJaar: item.groeiPerJaar
         }
     })
     return filteredGrowth
 }