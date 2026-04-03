import { roomAmenitiesApi } from "./roomAmenitiesApi";
import { roomInventoriesApi } from "./roomInventoriesApi";
import { roomsApi } from "./roomsApi";
import { roomTypesApi } from "./roomTypesApi";

export const roomApi = {
  ...roomsApi,
  ...roomTypesApi,
  ...roomInventoriesApi,
  ...roomAmenitiesApi,
};
