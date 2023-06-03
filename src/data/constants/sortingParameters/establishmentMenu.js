import {Choice} from "../../../utils/choices";


export const SORTING_BY_PRICE = new Choice('final_price', 'By price');
export const SORTING_BY_NAME = new Choice('dish__name', 'By name');
export const ESTABLISHMENT_MENU_SORTING_PARAMETERS = [SORTING_BY_PRICE, SORTING_BY_NAME];
