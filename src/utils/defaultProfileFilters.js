import {
  BODY_TYPE,
  EDUCATION,
  LOOKING_FOR,
  MAX_AGE,
  MEET_AT,
  MIN_AGE,
  MIN_DISTANCE,
  MIN_HEIGHT,
  NSFW_PICS,
} from './staticData';

const DEFAULT_COORDS = {
  latitude: 51.5072,
  longitude: 0.1276,
};

export const buildDefaultFilterFormData = (userData = {}, coordinates = {}) => {
  const coords = {
    latitude: coordinates?.latitude ?? DEFAULT_COORDS.latitude,
    longitude: coordinates?.longitude ?? DEFAULT_COORDS.longitude,
  };

  const apiData = new FormData();
  apiData.append('looking_for', LOOKING_FOR[0]);
  apiData.append('distance', String(MIN_DISTANCE));
  apiData.append('from_age', String(MIN_AGE));
  apiData.append('to_age', String(MAX_AGE));
  apiData.append('maximum_height', String(MIN_HEIGHT));
  apiData.append('education', EDUCATION[EDUCATION.length - 1]);
  apiData.append('occupation', '');
  apiData.append('meet_at', MEET_AT[0]);
  apiData.append('nsfw_pics', NSFW_PICS[NSFW_PICS.length - 1]);
  apiData.append('weight', '0');
  apiData.append('tribes', 'Not Specified');
  apiData.append('religion', 'any');
  apiData.append('location', userData?.city || 'London');
  apiData.append('lat', String(coords.latitude));
  apiData.append('long', String(coords.longitude));
  apiData.append('body_type', BODY_TYPE[BODY_TYPE.length - 1]);
  apiData.append('interested_in', userData?.gender === 1 ? '2' : '1');
  apiData.append('lifestyle', '');
  apiData.append('sexuality', '2');
  apiData.append('married_status', '5');
  apiData.append('having_kids', 'Any');

  return apiData;
};
