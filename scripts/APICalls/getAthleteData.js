// build HTTP request object
const athleteId = args[0]

const stravaGetAtheleteRequest = Functions.makeHttpRequest({
    url: `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
    headers: {
        "Content-Type": `application/json`,
        Authorization: `Bearer ${secrets.accessToken}`,
    },
})

// Make the HTTP request
const stravaGetAtheleteResponse = await stravaGetAtheleteRequest

if (stravaGetAtheleteResponse.error) {
    throw new Error("STRAVA Error", stravaGetAtheleteResponse.error)
}

const data = stravaGetAtheleteResponse["data"]
if (data.Response === "Error") {
    console.error(data.Message)
    throw Error(`Functional error. Read message: ${data.Message}`)
}

const { distance } = data["all_run_totals"]
// const endIndex = distance.indexOf("}");
// const distanceInteger = distance.slice(12, endIndex - 1);
const result = parseInt(distance)

return Functions.encodeUint256(result)
