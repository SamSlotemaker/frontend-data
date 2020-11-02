//returns array of objects, given date should be YYYYMMDD
export function refactorDates(dateArray) {
    let newArray = []
    dateArray.forEach(date => {
        let newDate = {}
        if (date != null && date.length == 8) { //check if date is valid
            newDate.year = date[0] + date[1] + date[2] + date[3]
            newDate.month = date[4] + date[5]
            newDate.day = date[6] + date[7]
            newArray.push(newDate)
        }
    })
    return newArray;
}