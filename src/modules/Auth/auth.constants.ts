
const ONE_DAY = 60 * 60 * 24;
export const EXPIRED = {
  ACCESS: 60 * 60 * 12, //12h
  // ACCESS: 30,
  REFRESH: ONE_DAY * 30,  //30d
  // REFRESH: 60 * 2,
  WITH_REMEMBER: ONE_DAY * 365, //365d
}