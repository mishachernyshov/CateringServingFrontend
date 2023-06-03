import {Choice} from "../../../utils/choices";

export const SORTING_BY_RATING = new Choice('rating', 'By rating');
export const SORTING_BY_NAME = new Choice('name', 'By name');
export const CATERING_ESTABLISHMENTS_CATALOG_SORTING_PARAMETERS = [SORTING_BY_RATING, SORTING_BY_NAME];
