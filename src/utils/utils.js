import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

import {SOCKET_URL} from '../config/urls';
import {saveUserDataToStore} from '../redux/reduxActions/authActions';
import {removeZegoCloud} from './zegoConfigureFile';

export async function getHeaders() {
  let userData = await AsyncStorage.getItem('userData');
  if (userData) {
    userData = JSON.parse(userData);
    if (userData?.token !== undefined) {
      return {
        authorization: `${'Bearer ' + userData.token}`,
      };
    }
  }
  return {};
}

export function setUserData(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('userData', data);
}

export function setItem(key, data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem(key, data);
}

export function setWalkSafeCoordinatesAsync(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('walkSafeCoordinates', data);
}

export function removeWalkSafeCoordinatesAsync() {
  return AsyncStorage.removeItem('walkSafeCoordinates');
}

export function getWalkSafeCoordinatesAsync() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('walkSafeCoordinates').then(data => {
      resolve(JSON.parse(data));
    });
  });
}

export function getItem(key) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key).then(data => {
      resolve(JSON.parse(data));
    });
  });
}

export function removeItem(key) {
  return AsyncStorage.removeItem(key);
}

export function clearAsyncStorate(key) {
  return AsyncStorage.clear();
}

export async function getUserData() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('userData').then(data => {
      resolve(JSON.parse(data));
    });
  });
}

export async function getOnBoardData() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('onBoard').then(data => {
      resolve(JSON.parse(data));
    });
  });
}

export async function getLoginPin() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('LoginPin').then(data => {
      resolve(JSON.parse(data));
    });
  });
}

export async function setLoginPin(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('LoginPin', data);
}

export async function clearLoginPin() {
  return AsyncStorage.removeItem('LoginPin');
}

export async function clearUserData() {
  return AsyncStorage.removeItem('userData');
}

export async function apiReq(
  endPoint,
  data,
  method,
  headers,
  requestOptions = {},
) {
  // console.log(endPoint, 'endPoint');
  return new Promise(async (res, rej) => {
    const getTokenHeader = await getHeaders();
    // console.log('userTokennnnn', getTokenHeader);

    headers = {
      ...getTokenHeader,
      ...headers,
    };

    // if (method === 'get' || method === 'delete') {
    //   data = {
    //     ...requestOptions,
    //     ...data,
    //     headers,
    //   };
    // }

    // console.log('API Endpoint :-> ', endPoint);
    // console.log('API Data :-> ', data);
    // console.log('API Headers :-> ', headers);

    axios({
      method,
      url: endPoint,
      params: data,
      headers,
      data,
    })
      .then(result => {
        // console.log('API Result :-> ', result);
        const {data} = result;
        if (data.status === false) {
          return rej(data);
        }
        return res(data);
      })
      .catch(error => {
        console.log('API error =>', error);

        const errorResponse = error?.response;

        if (errorResponse?.status === 401) {
          removeZegoCloud();
          clearUserData();
          saveUserDataToStore(null);
        }

        if (error?.response?.data) {
          if (!error?.response?.data?.message) {
            return rej({
              ...error?.response?.data,
              msg: error?.response?.data?.message || 'Network Error',
            });
          }
          return rej(error?.response?.data);
        } else {
          return rej({message: 'Network Error', msg: 'Network Error'});
        }
      });
  });
}

export function apiPost(endPoint, data, headers) {
  return apiReq(endPoint, data, 'post', headers);
}

export function apiDelete(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'delete', headers);
}

export function apiGet(endPoint, data, headers = {}, requestOptions) {
  return apiReq(endPoint, data, 'get', headers, requestOptions);
}

export function apiPut(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'put', headers);
}

export function clearAsyncStorage(key) {
  return AsyncStorage.clear();
}

export var socketRef;

export const ConnectingSocket = userData => {
  const socketLink = `${SOCKET_URL}?user_id=${userData?.id}`;
  // console.log(socketLink, 'scocket link --->>>>');
  socketRef = io(socketLink, {transports: ['websocket']});
  // console.log(socketRef, 'socket red----->>>>>');
  socketRef.on('connect', () => {
    console.log('===== socket connected ===== ConnectingSocket');
  });
};
