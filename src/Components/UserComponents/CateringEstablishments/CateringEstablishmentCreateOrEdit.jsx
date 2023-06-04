import React, {useCallback, useEffect, useReducer, useState} from "react";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {useTranslation} from "react-i18next";
import {useParams, useLocation as useRouterLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import TimeRange from "react-timeline-range-slider";

import CateringEstablishmentDish from './CateringEstablishmentDish';
import Location from "../../InputWrappers/Location";
import {makeAuthenticatedRequest, useAuthenticallyFetchedData} from '../../../utils/request';
import locationReducer from "../../../data/reducers/location";
import {DISH_RELATED_DATA} from "../../../data/constants/queryKeys";
import Spinner from "react-bootstrap/Spinner";
import LocationChangeType from "../../../data/enums/locationChangeType";
import timelineReducer from "../../../data/reducers/timeline";
import TimelineChangeType from "../../../data/enums/timelineChangeType";
import {getTodayAtSpecificTime, getWorkHoursInterval, extractTime} from "../../../utils/datetime";
import {TIME_LOCATE} from "../../../data/constants/settings";
import {dummyFunction} from "../../../utils/functools";
import ComponentMode from "../../../data/enums/componentMode";
import deepcopy from "deepcopy";


const workHoursInterval = getWorkHoursInterval();


export default function CateringEstablishmentCreateOrEdit () {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibilityStatus, setVisibilityStatus] = useState(true);
  const [tables, setTables] = useState([]);
  const [newTableData, setNewTableData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [timeline, dispatchTimeline] = useReducer(
    timelineReducer,
    {
      disabledIntervals: [],
      error: false,
      timeRange: [getTodayAtSpecificTime({hours: 8}), getTodayAtSpecificTime({hours: 22})],
    },
  );
  const {data: dishRelatedData, status: dishRelatedDataStatus} = useAuthenticallyFetchedData(
    DISH_RELATED_DATA,
    {url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_DISH_RELATED_DATA_URL},
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

  const {t} = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const routerLocation = useRouterLocation();

  const getModeInfo = () => {
    const modeInfo = {};

    if (routerLocation.pathname.endsWith('new')) {
      modeInfo['name'] = ComponentMode.Creation;
    } else {
      modeInfo['name'] = ComponentMode.Editing;
      modeInfo['additionalData'] = {id: params.id};
    }

    return modeInfo;
  };

  const [modeInfo] = useState(getModeInfo);

  const getDishEditingInfo = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          process.env.REACT_APP_BACKEND_URL
          + process.env.REACT_APP_CATERING_ESTABLISHMENT_EDIT_INFO_URL.replace('[pk]', modeInfo['additionalData']['id'])
        ),
      },
      navigate,
    );
  }, [modeInfo, navigate]);

  const convertDishesToStandardRepresentation = useCallback(dishes => {
    for (const dish of dishes) {
      if (dish['discount'] && Object.keys(dish['discount']).length) {
        dish['discount']['enabled'] = true;
      } else {
        dish['discount'] = {
          enabled: false,
          type: 'percent',
          amount: 0,
          start_datetime: '1900-01-01T00:00',
          end_datetime: '1900-01-01T00:00',
        };
      }
    }
  }, []);

  useEffect(
    () => {
      (async () => {
        if (modeInfo['name'] === ComponentMode.Editing) {
          const dishEditingInfoResponse = await getDishEditingInfo();

          setName(dishEditingInfoResponse.data['name']);
          setDescription(dishEditingInfoResponse.data['description']);
          setVisibilityStatus(dishEditingInfoResponse.data['is_visible']);
          setTables(dishEditingInfoResponse.data['tables']);
          setPhotos(dishEditingInfoResponse.data['photos']);
          dispatchTimeline({
            type: TimelineChangeType.TIME_RANGE_CHANGED,
            payload: [
              extractTime(dishEditingInfoResponse.data['work_hours']['start_time']),
              extractTime(dishEditingInfoResponse.data['work_hours']['end_time']),
            ],
          });

          const dishes = dishEditingInfoResponse.data['dishes'];
          convertDishesToStandardRepresentation(dishes);
          setDishes(dishes);

          const addressData = dishEditingInfoResponse.data['address'];
          dispatchLocation({
            type: LocationChangeType.ENTIRE_LOCATION_UPDATE,
            payload: {
              address: addressData['name'],
              settlement: addressData['settlement'],
            },
          });
        }
      })();
    },
    [
      modeInfo,
      getDishEditingInfo,
      convertDishesToStandardRepresentation,
    ],
  );

  const loadPhoto = event => {
    if (event.target.files.length) {
      setPhotos([...photos, URL.createObjectURL(event.target.files[0])]);
    }
    event.target.value = "";
  };

  const deletePhoto = photo => {
    const updatedPhotos = photos.filter(currentPhoto => currentPhoto !== photo);
    setPhotos(updatedPhotos);
  };

  const changeTableCharacteristic = (table, characteristic, newValue) => {
    const updatedTables = [...tables];
    for (const currentTable of updatedTables) {
      if (currentTable === table) {
        currentTable[characteristic] = newValue;
        break;
      }
    }
    setTables(updatedTables);
  };

  const changeNewTableCharacteristic = (characteristic, newValue) => {
    const updatedTable = {...newTableData};
    updatedTable[characteristic] = newValue;
    setNewTableData(updatedTable);
  };

  const addTable = () => {
    const updatedTables = [...tables, newTableData];

    setTables(updatedTables);
    setNewTableData({number: '', serving_clients_number: ''});
  };

  const deleteTable = index => {
    const updatedTables = tables.toSpliced(index, 1);
    setTables(updatedTables);
  };

  const updateWorkHours = useCallback(selectedInterval => {
    dispatchTimeline({type: TimelineChangeType.TIME_RANGE_CHANGED, payload: selectedInterval});
  }, []);

  const blobToBase64 = blob => new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  const getDataToSend = async () => {
    const data = {
      name: name,
      description: description,
      is_visible: visibilityStatus,
      work_hours: {
        start_time: timeline.timeRange[0].toLocaleTimeString(TIME_LOCATE),
        end_time: timeline.timeRange[1].toLocaleTimeString(TIME_LOCATE),
      },
      address: {
        settlement: location['settlement'],
        name: location['address'],
      },
      tables: tables,
      photos: [],
    };

    for (const photo of photos) {
      await axios({url: photo, responseType: 'blob'})
        .then(response => blobToBase64(response.data))
        .then(encodedImage => data['photos'].push(encodedImage));
    }

    const dishesToSend = deepcopy(dishes);
    for (const dish of dishesToSend) {
      if (!dish['discount']['enabled']) {
        delete dish['discount'];
      }
      await axios({url: dish.photo, responseType: 'blob'})
        .then(response => blobToBase64(response.data))
        .then(encodedImage => {
          dish.photo = encodedImage;
        });
    }
    data['dishes'] = dishesToSend;

    return new Promise((resolve, _) => {
      resolve(data);
    });
  };

  const handleCateringEstablishmentCreation = async () => {
    const dataToSend = await getDataToSend();

    return makeAuthenticatedRequest(
      {
        url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_CATERING_ESTABLISHMENT_CREATION_URL,
        method: 'post',
        data: dataToSend,
      },
      navigate,
    )
      .then(response => navigate(`/user_catering_establishments/edit/${response.data.id}`));
  };

  const handleCateringEstablishmentUpdating = async () => {
    const dataToSend = await getDataToSend();

    return makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CATERING_ESTABLISHMENT_URL}${modeInfo['additionalData']['id']}/`,
        method: 'patch',
        data: dataToSend,
      },
      navigate,
    );
  }

  return (
    <div className='page-content-wrapper'>
      <div className='form-wrapper'>
        <div>{t("Name")}</div>
        <Form.Control
          maxLength='64'
          value={name}
          onChange={event => {
            setName(event.target.value);
          }}
          style={{ maxWidth: 500 }}
        />
        <div>{t("Description")}</div>
        <Form.Control
          as="textarea"
          rows="4"
          value={description}
          onChange={event => {
            setDescription(event.target.value);
          }}
        />
        <Form.Check
          type='checkbox'
          label={t('Is visible')}
          checked={visibilityStatus}
          onChange={event => {
            setVisibilityStatus(event.target.checked);
          }}
        />
        <div></div>
        <div>{t('Location')}</div>
        <Location location={location} dispatchLocation={dispatchLocation} />
        <div>{t('Work hours')}</div>
        <TimeRange
          error={timeline.error}
          mode={2}
          selectedInterval={timeline.timeRange}
          timelineInterval={workHoursInterval}
          onChangeCallback={updateWorkHours}
          onUpdateCallback={dummyFunction}
          disabledIntervals={timeline.disabledIntervals}
        />
        <div>{t("Tables")}</div>
        <div className='cards-list'>
          {
            tables.map((table, index) =>
              <Card key={index}>
                <Card.Body>
                  <div className='table-card-content'>
                    <div className='table-number-name'>{t('Number')}</div>
                    <Form.Control
                      className='table-number-value'
                      type="number"
                      value={table.number}
                      min='1'
                      onChange={event => changeTableCharacteristic(table, 'number', event.target.value)}
                    />
                    <div className='table-clients-number-name'>{t('Serving clients number')}</div>
                    <Form.Control
                      className='table-clients-number-value'
                      type="number"
                      value={table.serving_clients_number}
                      min='1'
                      onChange={event => changeTableCharacteristic(table, 'serving_clients_number', event.target.value)}
                    />
                    <div onClick={_ => deleteTable(index)} className='table-action-button'>
                      <div className='cross table-action'></div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )
          }
          <Card>
            <Card.Body>
              <div className='table-card-content'>
                <div className='table-number-name'>{t('Number')}</div>
                <Form.Control
                  className='table-number-value'
                  type="number"
                  min='1'
                  value={newTableData.number}
                  onChange={event => changeNewTableCharacteristic('number', event.target.value)}
                />
                <div className='table-clients-number-name'>{t('Serving clients number')}</div>
                <Form.Control
                  className='table-clients-number-value'
                  type="number"
                  min='1'
                  value={newTableData.serving_clients_number}
                  onChange={event => changeNewTableCharacteristic('serving_clients_number', event.target.value)}
                />
                <div onClick={addTable} className='table-action-button'>
                  <div className='plus table-action'></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div>{t('Photos')}</div>
        <div className='cards-list'>
          {
            photos.map((photo, index) =>
              <Card key={index}>
                <Card.Body>
                  <Card.Img src={photo} />
                  <div className='card-action'>
                    <Button
                      onClick={_ => deletePhoto(photo)}
                      variant="danger"
                    >
                      {t('Delete')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )
          }
          <Form.Group controlId="uploadPhoto">
            <Form.Label style={{margin: 0}}>
              <Card className='interactive-card'>
                <Card.Body>
                  <div className='add-photo-wrapper'>
                    <div className='plus add-photo'></div>
                  </div>
                  <div className='card-action'>
                    <div>{t('Upload photo')}</div>
                  </div>
                </Card.Body>
              </Card>
            </Form.Label>
            <Form.Control type="file" accept="image/*" onChange={loadPhoto} style={{display: 'none'}} />
          </Form.Group>
        </div>
        <div>{t('Dishes')}</div>
        {
          dishRelatedDataStatus === 'loading'
            ? <Spinner animation="border" variant="primary" />
            : <div className='cards-list'>
            {
              dishes.map((dish, index) =>
                <CateringEstablishmentDish
                  key={index}
                  dish={dish}
                  dishes={dishes}
                  setDishes={setDishes}
                  dishRelatedData={dishRelatedData}
                />
              )
            }
          <CateringEstablishmentDish
            dishes={dishes}
            setDishes={setDishes}
            dishRelatedData={dishRelatedData}
          />
        </div>
        }
      </div>
      <div id='catering-establishment-create-or-edit-actions'>
        {
          modeInfo['name'] === ComponentMode.Creation
            ? <Button
                variant="primary"
                size="lg"
                onClick={handleCateringEstablishmentCreation}
              >
                {t('Create')}
              </Button>
            : <Button
                variant="primary"
                size="lg"
                onClick={handleCateringEstablishmentUpdating}
              >
                {t('Save')}
              </Button>
        }
      </div>
    </div>
  );
}
