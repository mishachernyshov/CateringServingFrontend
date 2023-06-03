import {Dropdown, DropdownButton} from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';
import {useTranslation} from "react-i18next";
import React, {useEffect} from 'react';

import LocationChangeType from "../../data/enums/locationChangeType";
import Form from "react-bootstrap/Form";
import {useAuthenticallyFetchedData} from '../../utils/request';
import {LOCATIONS} from "../../data/constants/queryKeys";
import * as locationUtils from "../../utils/location";
import {doesLocationHasMissedValues, getFilledAddressLocation} from "../../utils/location";


export default React.memo(function Location ({location, dispatchLocation, locationsData, className}) {
  const {t} = useTranslation();
  const {
    data: locations = (locationsData || {countries: []}),
    status: locationsStatus,
  } = useAuthenticallyFetchedData(
    LOCATIONS,
    {url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_LOCATIONS_DATA_URL},
    {enabled: !locationsData},
  );

  const changeCountry = countryId => {
    dispatchLocation({type: LocationChangeType.COUNTRY_CHANGED, payload: parseInt(countryId)});
  }

  const changeRegion = regionId => {
    dispatchLocation({type: LocationChangeType.REGION_CHANGED, payload: parseInt(regionId)});
  }

  const changeSettlement = settlementId => {
    dispatchLocation({type: LocationChangeType.SETTLEMENT_CHANGED, payload: parseInt(settlementId)});
  }

  const changeAddress = event => {
    dispatchLocation({type: LocationChangeType.ADDRESS_CHANGED, payload: event.target.value});
  }

  useEffect(() => {
    if (locationsStatus === 'success' && doesLocationHasMissedValues(location)) {
      dispatchLocation({
        type: LocationChangeType.ENTIRE_LOCATION_UPDATE,
        payload: getFilledAddressLocation(location, locations),
      });
    }
  }, [location, dispatchLocation, locations, locationsStatus]);

  if (locationsStatus === 'loading') {
    return <Spinner animation="border" variant="primary" />;
  }
  return (
    <div className={`inputs-sequence-wrapper ${className}`}>
      <div className='inputs-sequence-item-wrapper'>
        <div>{t('Country')}</div>
        <DropdownButton
          variant='primary'
          title={location.country ? locationUtils.getCountry(location.country, locations.countries).name : t('Choose a country')}
          onSelect={changeCountry}
        >
          {
            locations.countries.map(currentCountry =>
              <Dropdown.Item
                eventKey={currentCountry.id}
                key={currentCountry.id}
                active={location.country && currentCountry.id === location.country}
              >
                {currentCountry.name}
              </Dropdown.Item>
            )
          }
        </DropdownButton>
      </div>
      {
        location.country
        && <div className='inputs-sequence-item-wrapper'>
          <div>{t('Region')}</div>
          <DropdownButton
            variant='primary'
            title={location.region ? locationUtils.getRegion(location.region, locations.regions).name : t('Choose a region')}
            onSelect={changeRegion}
          >
            {
              locationUtils.getCountryRegions(location.country, locations.regions).map(currentRegion =>
                <Dropdown.Item
                  eventKey={currentRegion.id}
                  key={currentRegion.id}
                  active={location.region && currentRegion.id === location.region}
                >
                  {currentRegion.name}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
        </div>
      }
      {
        location.region
        && <div className='inputs-sequence-item-wrapper'>
          <div>{t('Settlement')}</div>
          <DropdownButton
            variant='primary'
            title={location.settlement ? locationUtils.getSettlement(location.settlement, locations.settlements).name : t('Choose a settlement')}
            onSelect={changeSettlement}
          >
            {
              locationUtils.getRegionSettlements(location.region, locations.settlements).map(currentSettlement =>
                <Dropdown.Item
                  eventKey={currentSettlement.id}
                  key={currentSettlement.id}
                  active={location.settlement && currentSettlement.id === location.settlement}
                >
                  {currentSettlement.name}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
        </div>
      }
      {
        location.settlement
        && <div className='inputs-sequence-item-wrapper'>
          <div>{t('Address')}</div>
          <Form.Control
            maxLength='256'
            placeholder={t('Enter an address')}
            value={location.address}
            onChange={changeAddress}
          />
        </div>
      }
    </div>
  )
});
