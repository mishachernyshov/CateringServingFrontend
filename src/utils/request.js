import axios from "axios";
import {StatusCodes} from "http-status-codes";
import {useNavigate} from "react-router-dom";
import {useQuery} from "react-query";

export const getLanguageHeader = () => {
  const headers = {};
  const usedLanguage = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_LANGUAGE_KEY);
  if (usedLanguage) {
    headers['Accept-Language'] = usedLanguage;
  }
  return headers;
}

export const makeAuthenticatedRequest = async (requestParams, navigate) => {
  return axios(getRequestParamsWithAuthHeader(requestParams))
    .catch(error => {
      const refreshToken = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_REFRESH_TOKEN_KEY);
      if (error.response.status === StatusCodes.UNAUTHORIZED && refreshToken) {
        return axios({
          method: 'post',
          url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_REFRESH_URL,
          headers: {'Content-Type': 'application/json'},
          data: {'refresh': refreshToken},
        })
          .then(response => {
            localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_ACCESS_TOKEN_KEY, response.data['access']);
            return axios(getRequestParamsWithAuthHeader(requestParams));
          });
      } else {
        throw(error);
      }
    })
    .catch(error => {
      if (error.response.status === StatusCodes.UNAUTHORIZED) {
        localStorage.removeItem(process.env.REACT_APP_LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        localStorage.removeItem(process.env.REACT_APP_LOCAL_STORAGE_REFRESH_TOKEN_KEY);

        navigate('/login');
      } else {
        throw(error);
      }
    });
}

const getRequestParamsWithAuthHeader = (requestParams) => {
  const authenticatedRequestParams = {...requestParams};
  if (!authenticatedRequestParams['headers']) {
    authenticatedRequestParams['headers'] = {};
  }
  authenticatedRequestParams['headers']['Authorization'] = (
    `JWT ${localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_ACCESS_TOKEN_KEY)}`
  );
  return authenticatedRequestParams;
}

export function useAuthenticallyFetchedData (queryKey, requestParams, queryOptions) {
  const navigate = useNavigate();

  function getData () {
    return makeAuthenticatedRequest(requestParams, navigate)
      .then(response => response.data);
  }

  return useQuery(queryKey, getData, (queryOptions || {}));
}
