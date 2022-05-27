import https from 'https';
import axios from 'axios';
import { ErrorOther, ErrorValidation } from '@keithics/errors/lib/assert';

/**
 * Call Admin Service, service to service API call
 * can be called within the intranet or internet
 * @param adminJWT - JWT (admin)
 * @param data - post data
 * @param url - URL endpoint
 * @param method - method, default to post
 * @param sendError - if set to false, it will send back the error directly to the promise, useful if you don't want to send an error response automatically
 * @returns axios response from the server or promise reject
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function callService(adminJWT, data, url, method = 'post', sendError = true) {
  const axiosConfig = {
    // we can reject ssl errors since this is a service to service call
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    method,
    url,
    headers: {
      Authorization: 'Bearer ' + adminJWT,
    },
    data,
  };

  let serviceResponse;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data } = await axios(axiosConfig);
    serviceResponse = data;
  } catch (e) {
    if (e.response?.status === 422) {
      return Promise.reject(new ErrorValidation(e.response.data.message));
    } else {
      // by default, it will go directly to errorHandler
      const error = sendError ? new ErrorOther("Can't connect to Admin Service API " + url) : e;
      return Promise.reject(error);
    }
  }

  return serviceResponse;
}
