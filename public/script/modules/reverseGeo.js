import {
    getData
} from "../script.js";


//batch api ophalen
export function batchGeo(useApiData) {
    // The API Key provided is restricted to JSFiddle website
    // Get your own API Key on https://myprojects.geoapify.com
    var myAPIKey = "69641c25fc04489180dd7daffbd5a63b";
    var url = `https://api.geoapify.com/v1/batch?apiKey=${myAPIKey}`;

    return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(useApiData)
        })
        .then(getBodyAndStatus)
        .then((result) => {
            if (result.status !== 202) {
                return Promise.reject(result)
            } else {
                return getAsyncResult(`${url}&id=${result.body.id}`, 1000, 100).then(queryResult => {
                    return queryResult;
                });
            }
        }).then(result => {
            const resultArray = result.results
            const cityInfo = []
            resultArray.forEach(item => {
                cityInfo.push({
                    lat: item.params.lat,
                    lon: item.params.lon,
                    city: item.result.features[0].properties.city
                })
            })
            return cityInfo
            // console.log(cityInfo)
        })
        .catch(err => console.log(err));


    function getBodyAndStatus(response) {
        return response.json().then(responceBody => {
            return {
                status: response.status,
                body: responceBody
            }
        });
    }

    function getAsyncResult(url, timeout, maxAttempt) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                repeatUntilSuccess(resolve, reject, 0)
            }, timeout);
        });

        function repeatUntilSuccess(resolve, reject, attempt) {
            console.log("Attempt: " + attempt);
            fetch(url)
                .then(getBodyAndStatus)
                .then(result => {
                    if (result.status === 200) {
                        resolve(result.body);
                    } else if (attempt >= maxAttempt) {
                        reject("Max amount of attempt achived");
                    } else if (result.status === 202) {
                        // Check again after timeout
                        setTimeout(() => {
                            repeatUntilSuccess(resolve, reject, attempt + 1)
                        }, timeout);
                    } else {
                        // Something went wrong
                        reject(result.body)
                    }
                })
                .catch(err => reject(err));
        };
    }
}