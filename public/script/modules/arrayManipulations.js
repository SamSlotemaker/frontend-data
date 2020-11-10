//returns sorted array from small to large
export function sortArraySmallToLarge(array, property) {
    let newArray = copyArray(array)
    //check of er een property is meegegeven voor sorteren van objecten
    if (typeof property == 'undefined') { //geen property meegegeven
        let newArray = copyArray(array)
        return newArray.sort((a, b) => {
            return a - b
        })
    }
    //wel property meegegeven
    return newArray.sort((a, b) => {
        return a[property] - b[property]
    })
}

//returns sorted array from large to small
export function sortArrayLargeToSmall(array, property) {
    let newArray = copyArray(array)
    //check of er een property is meegegeven voor sorteren van objecten
    if (typeof property == 'undefined') { //geen property meegegeven
        let newArray = copyArray(array)
        return newArray.sort((a, b) => {
            return b - a
        })
    }
    //wel property meegegeven
    return newArray.sort((a, b) => {
        return b[property] - a[property]
    })
}

//returns copy from given array
export function copyArray(array) {
    let newArray = [...array]
    return newArray
}

//returns filtered array on given column
export function filterArray(array, column) {
    return array.map(arrayItem => arrayItem[column])
}

export function filterArrayThreeColumns(array, columnOne, columnTwo, columnThree) {
    return array.map(arrayItem => {
        return {
            [columnOne]: arrayItem[columnOne],
            [columnTwo]: arrayItem[columnTwo],
            [columnThree]: arrayItem[columnThree]
        }
    })
}
//return een array met alle unieke waardes van de meegegeven array
export function uniqueArray(array) {
    return [...new Set(array)];
}