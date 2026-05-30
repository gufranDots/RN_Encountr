// export const WALKSAFE_BASE_URL = "https://connect-staging.walksafe.mll.io/v1"
export const WALKSAFE_BASE_URL = "https://connect.walksafe.io/v1"

export const getApiUrl = (endpoint: string) => WALKSAFE_BASE_URL + endpoint;


export const GET_FRIENDS = getApiUrl("/Friends")
export const HOME_SAFE = getApiUrl("/HomeSafe")
export const SOS = getApiUrl("/Sos")
export const UPDATE_WALKSAFE_LOCATION = getApiUrl("/Location")