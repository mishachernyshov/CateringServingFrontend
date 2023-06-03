import {memo} from "react";
import {DISH_WEIGHT_BASE} from "../../data/constants/settings";
import Form from "react-bootstrap/Form";
import {RiDeleteBin2Fill} from "react-icons/ri";

import deepcopy from "deepcopy";


export default memo(function BookingDish ({orderedDish, dishesNames, booking, setBooking, isOrderEditable}) {
  const priceToPay = (
    orderedDish.weight * orderedDish.catering_establishment_dish.final_price / DISH_WEIGHT_BASE
  )
    .toFixed(2);

  const changeWeight = event => {
    const updatedBooking = deepcopy(booking);
    const updatedOrderedDish = updatedBooking.ordered_dishes.find(
      currentOrderedDish => (
        currentOrderedDish.catering_establishment_dish.dish === orderedDish.catering_establishment_dish.dish
      )
    );
    updatedOrderedDish.weight = event.target.value;
    setBooking(updatedBooking);
  };

  const deleteDishFromOrder = () => {
    const updatedBooking = deepcopy(booking);
    updatedBooking.ordered_dishes = updatedBooking.ordered_dishes.filter(
      currentOrderedDish => (
        currentOrderedDish.catering_establishment_dish.dish !== orderedDish.catering_establishment_dish.dish
      )
    );
    setBooking(updatedBooking);
  };

  return (
    <tr>
      <td>{dishesNames[orderedDish.catering_establishment_dish.dish]}</td>
      <td>{orderedDish.catering_establishment_dish.final_price.toFixed(2)}</td>
      <td>
        {
          isOrderEditable
            ? <Form.Control
                type='number'
                value={orderedDish.weight}
                onChange={changeWeight}
              />
            : orderedDish.weight
        }
      </td>
      <td>{priceToPay}</td>
      {
        isOrderEditable
          ? <td>
              <RiDeleteBin2Fill
                className='delete-ordered-dish'
                onClick={deleteDishFromOrder}
              />
            </td>
          : <></>
      }
    </tr>
  );
});
