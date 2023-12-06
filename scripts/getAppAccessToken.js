const URLSearchParams = require("url").URLSearchParams

async function getAccessToken() {
    const { default: fetch } = await import("node-fetch")

    const url = "https://www.strava.com/api/v3/oauth/token"
    const clientId = "116415"
    const clientSecret = "4784e5e419141ad81ecaac028eb765f0311ee0af"
    const refreshToken = "07312fda12e0099cfc5b89beba8a06fb1debc72b"

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
        console.log(data)
        return data.access_token.toString()
    } catch (error) {
        console.error("Error:", error)
        throw error // Re-throw the error for handling by the caller
    }
}

// Usage example:
getAccessToken()
    .then((accessToken) => {
        console.log("Access Token:", accessToken.toString())
    })
    .catch((error) => {
        console.error("Error fetching access token:", error)
    })

module.exports = getAccessToken // Export the function for use in other modules
