import {AfterViewInit, Component, HostListener} from '@angular/core';
import {DataService} from './data/data.service';
import * as mapboxgl from 'mapbox-gl';
import {pulsingSensor} from './pulsing-sensor';
import {UserData} from './data/user-data.interface';
import {SensorData} from './data/sensor-data.interface';
import {userPaths} from './users-paths';
import {interval} from 'rxjs';

declare const Mazemap;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  private readonly startLngLat = {lng: 11.179880, lat: 60.820010};
  private map: mapboxgl.Map;
  users: UserData[];
  sensors: SensorData[];
  evacuationStarted = false;

  constructor(private dataService: DataService) {
  }

  ngAfterViewInit(): void {
    this.map = this.mapInit();

    this.map.on('load', this.mapOnLoad.bind(this));
    this.map.on('zlevel', this.mapOnZLevel.bind(this));
    this.map.on('click', this.mapOnClick.bind(this));
  }

  private mapOnLoad(): void {
    this.sensorsSourceAndLayerInit();

    this.dataService.getUsers().subscribe(users => {
      this.users = users;
    });

    this.dataService.getSensors().subscribe(sensors => {
      this.sensors = sensors;

      this.setUpSensors(sensors);
    });
  }

  startEvacuate(): void {
    userPaths.forEach(userPath => {
      let i = 0;
      let step = userPath.steps[i];
      const marker = this.createEmployeeMarker(step.lng, step.lat, step.zLevel);
      const user = this.users.find(u => u.uuid === userPath.uuid);
      const sub = interval(700).subscribe(() => {
        i++;
        step = userPath.steps[i];

        if (i === userPath.steps.length - 1) {
          user.status = 'OUTSIDE';
          if (user.uuid === '52c7a70f-6f69-40ca-bec1-63346c8d1346') {
            user.status = 'UNSURE OUTSIDE';
          }

          sub.unsubscribe();
        }

        user.coordinates.zLevel = step.zLevel;
        user.coordinates.lat = step.lat;
        user.coordinates.lng = step.lng;
        marker.setLngLat({lng: step.lng, lat: step.lat});
        marker.setZLevel(step.zLevel);
      });
    });
  }

  private mapOnClick(e): void {
  }

  private mapOnZLevel(): void {
    this.map.setFilter('sensors', ['==', 'zLevel', this.map.zLevel]);
  }

  private mapInit(): any {
    return new Mazemap.Map({
      container: 'map-container',
      center: this.startLngLat,
      zoom: 18.8
    });
  }

  private sensorsSourceAndLayerInit(): any {
    this.map.addImage('sensor', pulsingSensor(100, this.map), {pixelRatio: 2});

    this.map.addSource('sensors', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    this.map.addLayer({
      id: 'sensors',
      type: 'symbol',
      source: 'sensors',
      layout: {
        'icon-image': 'sensor'
      },
      filter: ['==', 'zLevel', 1],
    }, 'mm-building-label');
  }

  private setUpSensors(sensorsData: SensorData[]): void {
    const sensorsGeoPoints = sensorsData.map(sensorData => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [sensorData.coordinates.lng, sensorData.coordinates.lat]
      },
      properties: {zLevel: sensorData.coordinates.zLevel}
    }));

    this.map.getSource('sensors').setData({
      type: 'FeatureCollection',
      features: sensorsGeoPoints
    });
  }

  @HostListener('window:keydown', ['$event'])
  windowKeyDownListener(event) {
    if (event.shiftKey && event.key.toUpperCase() === 'E') {
      this.evacuationStarted = true;
      this.startEvacuate();
    }
  }

  private createEmployeeMarker(lng: number, lat: number, zLevel: number): any {
    const oneOrZero = Math.random() > 0.5 ? 1 : 0;

    const employeeMarkerData = {
      imageUrl: ['/assets/man-icon.png', '/assets/woman-icon.png'][oneOrZero],
      width: 20,
      height: 20,
      offset: [0, 0],
      lngLat: {lng, lat}
    };

    const el = document.createElement('img');
    el.src = employeeMarkerData.imageUrl;
    el.style.width = employeeMarkerData.width + 'px';
    el.style.height = employeeMarkerData.height + 'px';

    return new Mazemap.ZLevelMarker(el, {
      zLevel,
      offset: employeeMarkerData.offset,
      offZOpacity: 0,
    })
      .setLngLat(employeeMarkerData.lngLat)
      .addTo(this.map);
  }

  localizeUser(userUuid: string) {
    const user = this.users.find(u => u.uuid === userUuid);

    this.map.flyTo({
      center: [user.coordinates.lng, user.coordinates.lat],
      zoom: 20,
      bearing: 0,
      speed: 0.6, // make the flying slow
      curve: 1, // change the speed at which it zooms out
      easing: t => t,
      essential: true
    });
  }
}
