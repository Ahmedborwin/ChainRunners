const access_token = "409579c760ee1674d699fa821db9923f3c8d293d"

// build HTTP request object
const userId = args[0]

const stravaGetAtheleteRequest = Functions.makeHttpRequest({
    url: `https://www.strava.com/api/v3/athletes/${userId}/stats`,
    headers: {
        "Content-Type": `application/json`,
        Authorization: `Bearer ${access_token}`,
    },
})

// Make the HTTP request
const stravaGetAtheleteResponse = await stravaGetAtheleteRequest

if (stravaGetAtheleteResponse.error) {
    throw new Error("STRAVA Error")
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
