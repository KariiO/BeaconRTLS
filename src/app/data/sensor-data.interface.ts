export interface SensorData {
  uuid: string;
  coordinates: {
    lat: number;
    lng: number;
    zLevel: number;
  };
}
