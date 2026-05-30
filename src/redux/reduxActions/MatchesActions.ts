import { GET_BONKERS_FRIENDS, GET_BONKERS_REQUESTS, GET_FAVOURITE_USERS, WHO_LIKE_ME } from "../../config/urls"
import { apiGet } from "../../utils/utils"

export const getAllMatchesApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiGet(WHO_LIKE_ME + "?page=" + apiPayload?.pageNo + "&request_type=" + apiPayload?.type)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getAllFavouritesUsersApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiGet(GET_FAVOURITE_USERS + "?page=" + apiPayload?.pageNo + "&search=" + apiPayload?.searchText)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getBonkersRequestsApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiGet(GET_BONKERS_REQUESTS + "?page=" + apiPayload?.pageNo + "&search=" + apiPayload?.searchText)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

export const getBonkersFriendsApi = (apiPayload: any) => {
    return new Promise((resolve, reject) => {
        apiGet(GET_BONKERS_FRIENDS + "?page=" + apiPayload?.pageNo + "&search=" + apiPayload?.searchText ? apiPayload?.searchText : "")
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}