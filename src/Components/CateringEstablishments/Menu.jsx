import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useReducer, useState, useContext} from "react";
import {useTranslation} from "react-i18next";
import {makeAuthenticatedRequest, useAuthenticallyFetchedData} from "../../utils/request";
import SearchField from "../InputWrappers/SearchField";
import Spinner from "react-bootstrap/Spinner";
import MenuContent from "./MenuContent";
import {DISH_RELATED_DATA} from "../../data/constants/queryKeys";
import Sorting from "../InputWrappers/Sorting";
import {
  ESTABLISHMENT_MENU_SORTING_PARAMETERS,
  SORTING_BY_NAME,
} from "../../data/constants/sortingParameters/establishmentMenu";
import sortingReducer from "../../data/reducers/sorting";
import SortingOrderingType from "../../data/enums/sortingOrderingType";
import Filtration from "../InputWrappers/Filtration";
import DishCharacteristics from "../InputWrappers/DishCharacteristics";
import Filter from "../InputWrappers/Filter";
import dishCharacteristicsReducer from "../../data/reducers/dishCharacteristics";
import Range from "../InputWrappers/Range";
import rangeReducer from "../../data/reducers/range";
import Form from "react-bootstrap/Form";
import paginationReducer from "../../data/reducers/pagination";
import PaginationChangeType from "../../data/enums/paginationChangeType";
import {CATALOG_PAGE_SIZE} from "../../data/constants/settings";
import {TablesSetContext} from "./TablesContext";
import {WorkHoursSetContext} from "./WorkHoursContext";
import {UserBookingsSetContext} from "../Booking/UserBookingsContext";


export default React.memo(function Menu () {
  const [establishmentDishes, setEstablishmentDishes] = useState(null);
  const [searchParameter, setSearchParameter] = useState('');
    const {data: dishRelatedData, status: dishRelatedDataStatus} = useAuthenticallyFetchedData(
    DISH_RELATED_DATA,
    {url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_DISH_RELATED_DATA_URL},
  );
  const [sorting, dispatchSorting] = useReducer(
    sortingReducer,
    {parameter: SORTING_BY_NAME, ordering: SortingOrderingType.ASCENDING},
  );
  const [dishCharacteristics, dispatchDishCharacteristics] = useReducer(
    dishCharacteristicsReducer,
    {
      category: null,
      subcategory: null,
      food: null,
    },
  );
  const [pagination, dispatchPagination] = useReducer(
    paginationReducer,
    {number: 1, count: 1, lastChangeType: null},
  );
  const [priceRange, dispatchPriceRange] = useReducer(rangeReducer, {min: '', max: ''});
  const [withDiscountOnly, setWithDiscountOnly] = useState(false);
  const setTables = useContext(TablesSetContext);
  const setWorkHours = useContext(WorkHoursSetContext);
  const setUserBookings = useContext(UserBookingsSetContext);

  const {t} = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const establishmentId = params.id;

  const handleWithDiscountOnlyCheckingChange = event => {
    setWithDiscountOnly(event.currentTarget.checked);
  }

  const getOptionalItemsQuery = optionalEntries => {
    let query = '';
    for (const [key, value] of optionalEntries) {
      if (value) {
        query += `${key}=${value}&`;
      }
    }
    return query;
  }

  const getMenuQuery = useCallback(() => {
    const orderingSign = sorting['ordering'] === SortingOrderingType.DESCENDING ? '-' : '';
    let query = (
      `?catering_establishment=${establishmentId}&search=${searchParameter}&`
      + `ordering=${orderingSign}${sorting['parameter']['name']}&page_size=${CATALOG_PAGE_SIZE}&`
    );
    const optionalQueryItems = {
      has_discount: withDiscountOnly,
      final_price_min: priceRange['min'],
      final_price_max: priceRange['max'],
    };
    query += getOptionalItemsQuery([...Object.entries(dishCharacteristics), ...Object.entries(optionalQueryItems)]);

    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      query += `page=${pagination['number']}&`;
    }

    return query;
  }, [dishCharacteristics, establishmentId, priceRange, searchParameter, sorting, withDiscountOnly, pagination]);

  const getMenuContent = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENT_MENU_URL
          + getMenuQuery()
        ),
      },
      navigate,
    )
  }, [getMenuQuery, navigate]);

  const updateMenuContent = useCallback(() => {
    return getMenuContent()
      .then(response => {
        setEstablishmentDishes(response.data['results']);
        dispatchPagination({
          type: PaginationChangeType.DATA_CHANGED,
          payload: Math.ceil(response.data['count'] / CATALOG_PAGE_SIZE),
        });
      });
  }, [getMenuContent]);

  const handlePageChange = useCallback(pageInfo => {
    dispatchPagination({type: PaginationChangeType.PAGE_NUMBER_CHANGED, payload: pageInfo.selected + 1});
  }, []);

  const applyMenuPageData = useCallback(() => {
     return getMenuContent()
      .then(response => {
        setEstablishmentDishes(response.data['results']);
        dispatchPagination({type: PaginationChangeType.PAGE_DATA_APPLIED});
      });
  }, [getMenuContent]);

  const getTables = useCallback(() => {
    const url = (
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_TABLES_LIST_URL}`
      + `?catering_establishment=${establishmentId}&`
    );

    return makeAuthenticatedRequest({url: url}, navigate)
      .then(response => {
        setTables(response.data);
      });
  }, [navigate]);

  const getWorkHours = useCallback(() => {
    const url = (
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_WORK_HOURS_URL}`
      + `?id=${establishmentId}&`
    );

    return makeAuthenticatedRequest({url: url}, navigate)
      .then(response => {
        setWorkHours(response.data[establishmentId]);
      });
  }, [navigate]);

  const getUserBookings = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_USER_BOOKINGS_URL}?`
          + `catering_establishment=${establishmentId}&active_only=${true}&is_paid=false&`
        ),
      },
      navigate,
    )
      .then(response => {
        setUserBookings(response.data);
      });
  }, [navigate]);

  useEffect(() => {
    getTables();
  }, [getTables]);

  useEffect(() => {
    getWorkHours();
  }, [getWorkHours]);

  useEffect(() => {
    updateMenuContent();
  }, [sorting]);

  useEffect(() => {
    if (pagination.lastChangeType === PaginationChangeType.PAGE_NUMBER_CHANGED) {
      applyMenuPageData();
    }
  }, [pagination]);

  useEffect(() => {
    getUserBookings();
  }, [getUserBookings]);

  return (
    <div id='menu'>
      <div className='subtitle'>{t('Menu')}</div>
      {
        establishmentDishes === null || dishRelatedDataStatus === 'loading'
        ? <Spinner variant="primary" />
        : <div className='catalog-with-operations'>
          <div className='catalog-search-sort-wrapper'>
            <SearchField
              searchParameter={searchParameter}
              setSearchParameter={setSearchParameter}
              searchApplyHandler={updateMenuContent}
              placeholder={t('Enter a dish name')}
            />
            <Sorting
              parameters={ESTABLISHMENT_MENU_SORTING_PARAMETERS}
              sortingState={sorting}
              dispatchSortingState={dispatchSorting}
            />
          </div>
          <div className='catalog-filter-wrapper'>
            <Filtration applyFiltrationHandler={updateMenuContent}>
              <Filter name={t('Dish characteristics')}>
                <DishCharacteristics
                  dishCharacteristics={dishCharacteristics}
                  dispatchDishCharacteristics={dispatchDishCharacteristics}
                  dishRelatedData={dishRelatedData}
                  className='vertical-flexbox'
                />
              </Filter>
              <Filter name={t('Price')}>
                <Range type='number' rangeData={priceRange} dispatchRangeData={dispatchPriceRange} />
              </Filter>
              <Filter name={t('Discount')}>
                <Form.Check
                  checked={withDiscountOnly}
                  onChange={handleWithDiscountOnlyCheckingChange}
                  type="checkbox"
                  label={t('Only with discount')}
                />
              </Filter>
            </Filtration>
          </div>
          <MenuContent
            establishmentDishes={establishmentDishes}
            dishRelatedData={dishRelatedData}
            pagination={pagination}
            pageChangeHandler={handlePageChange}
          />
        </div>
      }
    </div>
  )
});
