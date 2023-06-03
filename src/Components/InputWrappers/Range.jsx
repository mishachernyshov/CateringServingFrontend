import {memo} from "react";
import Form from "react-bootstrap/Form";
import {useTranslation} from "react-i18next";

import RangeChangeType from "../../data/enums/rangeChangeType";


export default memo(function ({type, rangeData, dispatchRangeData, inputAttributes}) {
  const {t} = useTranslation();

  const handleMinChange = event => {
    dispatchRangeData({type: RangeChangeType.MIN_VALUE_CHANGED, payload: event.target.value});
  }

  const handleMaxChange = event => {
    dispatchRangeData({type: RangeChangeType.MAX_VALUE_CHANGED, payload: event.target.value});
  }

  return (
    <div className='range-wrapper'>
      <div className='range-item-wrapper'>
        <div>{t('From')}</div>
        <Form.Control onChange={handleMinChange} value={rangeData['min']} type={type} {...inputAttributes} />
      </div>
      <div className='range-item-wrapper'>
        <div>{t('To')}</div>
        <Form.Control onChange={handleMaxChange} value={rangeData['max']} type={type} {...inputAttributes} />
      </div>
    </div>
  )
})
