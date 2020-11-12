import * as calculations from './calculations.js'

//bereken price per hour in de meegegeven array en vul deze met resultaat
export function fillPricePerHour(array) {
    array.forEach(item => {
        item.uurPrijs = calculations.calculatePricePerHour(item.amountfarepart, item.stepsizefarepart)
    })
}

//schoon vermogen informatie op
export function cleanVermogenInfo(vermogenPerGemeente) {
    let vermogenPerGemeente2 = vermogenPerGemeente.map(item => {
        let gemeente = item.gemeente
        //vervang haakjes in plaatsnamen
        let gemeenteGeenHaakjes = gemeente.replace(/\(.*?\)/, "")
        //vervang spatie op het einde van sommige woorden door het vervangen van haakjes
        const lastLetter = gemeenteGeenHaakjes.slice(-1)
        if (lastLetter == ' ') {
            gemeenteGeenHaakjes = gemeenteGeenHaakjes.substr(0, gemeenteGeenHaakjes.length - 1)
        }
        //maak een valide nummer van het vermogen
        //geen bekend vermogen = 0
        let vermogen = item.vermogen
        vermogen = vermogen.replace(',', '.')
        vermogen = parseFloat(vermogen)
        if (vermogen) {
            return {
                gemeente: gemeenteGeenHaakjes,
                GemiddeldVermogenPlaats: vermogen
            }
        } else {
            return {
                gemeente: gemeenteGeenHaakjes,
                GemiddeldVermogenPlaats: 0
            }
        }
    })
    return vermogenPerGemeente2
}

//vul steden doormidden van het checken van lat- en longitude
export function fillCities(array1, array2) {
    array1.forEach(item => {
        array2.forEach(location => {
            if (location.latitude == item.location.latitude && location.longitude == item.location.longitude) {
                item.city = location.city
            }
        })
    })
}

//vull verkooppunten met gemiddeldes van andere objecten, stad is hierin de key
export function fillSellingpointsWithAverages(array1, array2, array3) {
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
export function joinObjects(array1, array2, columnNameKey1, columnNameKey2, columnResult1, columnResult2) {
    array1.forEach((item) => {
        array2.forEach(verkooppunt => {
            if (verkooppunt[columnNameKey1] == item[columnNameKey2]) {
                verkooppunt[columnResult1] = item[columnResult2]
            }
        })
    })
}

//formatteer de data zodat deze gebruikt kan worden in de scatterplot
export function formatScatterPlotData(uniqueScatterPlotData, scatterPlotData, vermogenPerGemeenteClean) {
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
                item.gemiddeldeUurPrijs = item2.gemiddeldeUurPrijs.toFixed(2)
                item.gemiddeldeGroeiPerJaar = item2.gemiddeldeGroeiPerJaar.toFixed(2)
            }
        })


        vermogenPerGemeenteClean.forEach(vermogenInfo => {
            if (item.city == vermogenInfo.gemeente) {
                item.GemiddeldVermogenPlaats = vermogenInfo.GemiddeldVermogenPlaats
            }
        })
    })
    //wanneer vermogen niet bekend is, zet deze op 0
    scatterPlotArray.forEach(item => {
        if (!item.hasOwnProperty('GemiddeldVermogenPlaats')) {
            item.GemiddeldVermogenPlaats = 0;
        }
    })
    return scatterPlotArray
}