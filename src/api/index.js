import axios from 'axios'

export const CompositeService = (method, url, body, token) => {
    return axios({
        baseURL: "http://localhost:8080/v1",
        method: method,
        url: url,
        data: body,
        headers: {
            "x-kukdemo-auth": token,
        },
    })
}

export const UserService = (method, url, body) => {
    return axios({
        baseURL: "https://dev-userservice.heykukdemo.co/v1",
        method: method,
        url: url,
        data: body,
        headers: {
            "X-Correlation-ID": "1"
        },
    })
}
