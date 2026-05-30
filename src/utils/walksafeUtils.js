import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

export async function getWalkSafeHeaders () {
  let userData = await AsyncStorage.getItem('walksafeUserData')
  if (userData) {
    userData = JSON.parse(userData)
    if (userData?.accessToken !== undefined) {
      return {
        authorization: `Bearer ${userData.accessToken}`
      }
    }
  }
  return {}
}

export async function apiWalksafeReq (
  endPoint,
  data,
  method,
  headers,
  requestOptions = {}
) {
  console.log(endPoint, 'endPoint')
  return new Promise(async (res, rej) => {
    const getTokenHeader = await getWalkSafeHeaders()
    console.log(getTokenHeader, 'getTokenHeader')

    headers = {
      ...getTokenHeader,
      ...headers
    }

    console.log('WALKSAFE API Endpoint :-> ', endPoint)
    console.log('WALKSAFE API Data :-> ', data)
    console.log('WALKSAFE API Headers :-> ', headers)

    axios({
      method,
      url: endPoint,
      params: data,
      headers,
      data
    })
      .then((result) => {
        // console.log('API Result :-> ', result)
        const { data } = result
        if (data.status === false) {
          return rej(data)
        }
        return res(data)
      })
      .catch(error => {
        console.log('API error =>', error)

        const errorResponse = error?.response

        // if (errorResponse?.status === 401) {
        //     removeZegoCloud()
        //     clearUserData()
        //     saveUserDataToStore(null)
        // }

        if (error?.response?.data) {
          return rej({ message: error?.response?.data })
        } else {
          return rej({ message: 'Network Error', msg: 'Network Error' })
        }
      })
  })
}

export function apiPostWalksafe (endPoint, data, headers = {}) {
  return apiWalksafeReq(endPoint, data, 'post', headers)
}

export function apiDeleteWalksafe (endPoint, data, headers = {}) {
  return apiWalksafeReq(endPoint, data, 'delete', headers)
}

export function apiGetWalksafe (endPoint, data, headers = {}, requestOptions) {
  return apiWalksafeReq(endPoint, data, 'get', headers, requestOptions)
}

export function apiPutWalksafe (endPoint, data, headers = {}) {
  return apiWalksafeReq(endPoint, data, 'put', headers)
}

export function apiPatchWalksafe (endPoint, data, headers = {}) {
  return apiWalksafeReq(endPoint, data, 'patch', headers)
}
