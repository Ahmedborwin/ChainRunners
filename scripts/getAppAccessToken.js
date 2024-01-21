const URLSearchParams = require("url").URLSearchParams

async function getAthleteAccessToken() {
    const { default: fetch } = await import("node-fetch")

    const url = "https://www.strava.com/api/v3/oauth/token"
    const clientId = process.env.REACT_APP_CLIENT_ID // "116415"
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET //"4784e5e419141ad81ecaac028eb765f0311ee0af"
    const refreshToken = "5dbe5a90769790da6ef3810118e407517e06050a"

    const formData = new URLSearchParams()
    formData.append("client_id", clientId)
    formData.append("client_secret", clientSecret)
    formData.append("grant_type", "refresh_token")
    formData.append("refresh_token", refreshToken)

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        })

        const data = await response.json()

        return data.access_token.toString()
    } catch (error) {
        console.error("Error:", error)
        throw error // Re-throw the error for handling by the caller
    }
}

//Mossab Details Hardcoded
//hacky

async function getAccessTokenAthlete2() {
    const { default: fetch } = await import("node-fetch")

    const url = "https://www.strava.com/api/v3/oauth/token"
    const clientId = process.env.REACT_APP_CLIENT_ID // "116415"
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET //"4784e5e419141ad81ecaac028eb765f0311ee0af"
    const Athlete_2_Refresh_Token = "519374ec392eb874d01e9b9014dbf2f8e14d2f54"

    const formData = new URLSearchParams()
    formData.append("client_id", clientId)
    formData.append("client_secret", clientSecret)
    formData.append("grant_type", "refresh_token")
    formData.append("refresh_token", Athlete_2_Refresh_Token)

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        })

        const data = await response.json()

        return data.access_token.toString()
    } catch (error) {
        console.error("Error:", error)
        throw error // Re-throw the error for handling by the caller
    }
}

async function getAccessTokens() {
    const accessTokenAthlete1 = await getAthleteAccessToken()
    const accessTokenAthlete2 = await getAccessTokenAthlete2()
    return { accessTokenAthlete1, accessTokenAthlete2 }
}

// Usage example:
getAccessTokens()
    .then((accessToken) => {
        console.log("Access Token:", JSON.stringify(accessToken))
    })
    .catch((error) => {
        console.error("Error fetching access token:", error)
    })

module.exports = getAccessTokens // Export the function for use in other modules
