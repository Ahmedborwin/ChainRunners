// This example shows how to make call an API using a secret
// https://coinmarketcap.com/api/documentation/v1/

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below

// build HTTP request object

const queryString =
    `client_id=${encodeURIComponent("116415")}&` +
    `client_secret=${encodeURIComponent("4784e5e419141ad81ecaac028eb765f0311ee0af")}&` +
    `code=${encodeURIComponent("ca39b8df9b0c3885df308c9bd20619f05cd5e407")}&` +
    `grant_type:=${encodeURIComponent("authorization_code")}`

const stravaGetAtheleteRequest = Functions.makeHttpRequest({
    method: "POST",
    url: "https://www.strava.com/oauth/token?" + queryString,
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

const { expires_at, refresh_token, access_token, bio } = data

const result = { expires_at, refresh_token, access_token, bio }

//Functions.encodeUint256(Math.round(price * 100))
return Functions.encodeString(JSON.stringify(result))
