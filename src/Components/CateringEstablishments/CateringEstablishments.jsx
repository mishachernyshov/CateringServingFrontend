import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useReducer, useState} from "react";

import Sorting from "../InputWrappers/Sorting";
import {
  SORTING_BY_RATING,
  CATERING_ESTABLISHMENTS_CATALOG_SORTING_PARAMETERS,
} from "../../data/constants/sortingParameters/cateringEstablishmentsCatalog";
import sortingReducer from "../../data/reducers/sorting";
import SortingOrderingType from "../../data/enums/sortingOrderingType";
import SearchField from "../InputWrappers/SearchField";
import Filtration from "../InputWrappers/Filtration";
import Filter from "../InputWrappers/Filter";
import Location from "../InputWrappers/Location";
import locationReducer from "../../data/reducers/location";
import MultiRangeSlider from "../InputWrappers/MultiRangeSlider";
import {makeAuthenticatedRequest, useAuthenticallyFetchedData} from "../../utils/request";
import {LOCATIONS} from "../../data/constants/queryKeys";
import {useNavigate} from "react-router-dom";
import {CATALOG_PAGE_SIZE} from "../../data/constants/settings";
import paginationReducer from "../../data/reducers/pagination";
import CatalogContent from "./CatalogContent";
import PaginationChangeType from "../../data/enums/paginationChangeType";


export default function CateringEstablishments () {
  const [sorting, dispatchSorting] = useReducer(
    sortingReducer,
    {parameter: SORTING_BY_RATING, ordering: SortingOrderingType.DESCENDING},
  );
  const [searchParameter, setSearchParameter] = useState('');
  const {data: locations = null} = useAuthenticallyFetchedData(
    LOCATIONS,
    {url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_LOCATIONS_DATA_URL},
  );
  const [location, dispatchLocation] = useReducer(
    locationReducer,
    {
      country: null,
      region: null,
      settlement: null,
      address: '',
    },
  );
  const [ratingFilterRange, setRatingFilterRange] = useState({min: 0, max: 5});
  const [pagination, dispatchPagination] = useReducer(
    paginationReducer,
    {number: 1, count: 1, lastChangeType: null},
  );
  const [cateringEstablishments, setCateringEstablishments] = useState(null);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const getLocationQuery = useCallback(() => {
    let query = '';
    for (const [key, value] of Object.entries(location)) {
      if (value) {
        if (key === 'address') {
          query += `address__name=${value}&`;
        } else {
          query += `${key}=${value}&`;
        }
      }
    }
    return query;
  }, [location]);

  const getCatalogQuery = useCallback(() => {
    const orderingSign = sorting['ordering'] === SortingOrderingType.DESCENDING ? '-' : '';
    let query = (
      `?search=${searchParameter}&ordering=${orderingSign}${sorting['parameter']['name']}&${getLocationQuery()}`
      + `rating_min=${ratingFilterRange['min']}&rating_max=${ratingFilterRange['max']}&page_size=${CATALOG_PAGE_SIZE}&`
    );
    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      query += `page=${pagination['number']}&`;
    }
    return query;
  }, [getLocationQuery, pagination, ratingFilterRange, searchParameter, sorting]);

  const getCatalogData = useCallback(async () => {
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENTS_CATALOG_URL
          + getCatalogQuery()
        ),
      },
      navigate,
    );
  }, [getCatalogQuery, navigate]);

  const updateCatalog = useCallback(() => {
    return getCatalogData()
      .then(response => {
        setCateringEstablishments(response.data['results']);
        dispatchPagination({
          type: PaginationChangeType.DATA_CHANGED,
          payload: Math.ceil(response.data['count'] / CATALOG_PAGE_SIZE),
        });
      });
  }, [getCatalogData]);

  const applyCatalogPageData = useCallback(() => {
     return getCatalogData()
      .then(response => {
        setCateringEstablishments(response.data['results']);
        dispatchPagination({type: PaginationChangeType.PAGE_DATA_APPLIED});
      });
  }, [getCatalogData]);

  const handlePageChange = useCallback(pageInfo => {
    dispatchPagination({type: PaginationChangeType.PAGE_NUMBER_CHANGED, payload: pageInfo.selected + 1});
  }, []);

  useEffect(() => {
    updateCatalog();
  }, [sorting]);

  useEffect(() => {
    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      applyCatalogPageData();
    }
  }, [pagination]);

  return (
    <div className='page-content-wrapper catalog-with-operations'>
      <div className='catalog-search-sort-wrapper'>
        <SearchField
          searchParameter={searchParameter}
          setSearchParameter={setSearchParameter}
          searchApplyHandler={updateCatalog}
          placeholder={t("Enter the name of establishment")}
        />
        <Sorting
          parameters={CATERING_ESTABLISHMENTS_CATALOG_SORTING_PARAMETERS}
          sortingState={sorting}
          dispatchSortingState={dispatchSorting}
        />
      </div>
      <div className='catalog-filter-wrapper'>
        <Filtration applyFiltrationHandler={updateCatalog}>
          <Filter name={t('Location')}>
            <Location
              location={location}
              dispatchLocation={dispatchLocation}
              locationsData={locations}
              className='vertical-flexbox'
            />
          </Filter>
          <Filter name={t('Rating')}>
            <MultiRangeSlider
              min={0}
              max={5}
              onChange={setRatingFilterRange}
            />
          </Filter>
        </Filtration>
      </div>
      <CatalogContent
        cateringEstablishments={cateringEstablishments}
        locations={locations}
        pagination={pagination}
        pageChangeHandler={handlePageChange}
      />
    </div>
  );
}
