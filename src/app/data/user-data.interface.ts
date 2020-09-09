export interface UserData {
  type: string;
  uuid: string;
  firstName: string;
  lastName: string;
  status: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
    zLevel: number;
  };
}
