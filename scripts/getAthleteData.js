// This example shows how to make call an API using a secret
// https://coinmarketcap.com/api/documentation/v1/

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below

const access_token = "9451c8a737800c8ff7d11515fff7d22a7f7b15cf"

// build HTTP request object
const userId = args[0]

const stravaGetAtheleteRequest = Functions.makeHttpRequest({
    url: `https://www.strava.com/api/v3/athletes/${userId}/stats`,
    headers: {
        "Content-Type": "application/json",
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
