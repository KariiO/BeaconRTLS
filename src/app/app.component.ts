import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {DataService} from './data/data.service';
import * as mapboxgl from 'mapbox-gl';
import {pulsingSensor} from './pulsing-sensor';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {UserData} from './data/user-data.interface';
import {animate, state, style, transition, trigger} from '@angular/animations';

declare const Mazemap;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('usersPaginator', {read: MatPaginator}) usersPaginator: MatPaginator;
  @ViewChild('sensorsPaginator', {read: MatPaginator}) sensorsPaginator: MatPaginator;
  private readonly startLngLat = {lng: 11.179880, lat: 60.820010};
  private map: mapboxgl.Map;
  usersDataSource: MatTableDataSource<UserData>;
  usersDisplayedColumns = ['uuid', 'type', 'firstName', 'lastName'];
  expandedElement: UserData | null;

  sensorsDataSource: MatTableDataSource<any>;
  sensorsDisplayedColumns = ['lng', 'lat', 'zLevel'];

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
      this.usersDataSource = new MatTableDataSource<UserData>(users);
      this.usersDataSource.paginator = this.usersPaginator;

      users.forEach(({coordinates}) =>
        this.createEmployeeMarker(coordinates.lng, coordinates.lat, coordinates.zLevel));
    });

    this.dataService.getSensors().subscribe(sensorsData => {
      console.log(this.sensorsPaginator === this.usersPaginator)
      this.sensorsDataSource = new MatTableDataSource<any>(sensorsData);
      this.sensorsDataSource.paginator = this.sensorsPaginator;

      this.setUpSensors(sensorsData);
    });
  }

  private mapOnClick(e): void {
    console.log(e.lngLat);
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

  private setUpSensors(sensorsData: any[]): void {
    const sensorsGeoPoints = sensorsData.map(sensorData => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [sensorData.lng, sensorData.lat]
      },
      properties: {zLevel: sensorData.zLevel}
    }));

    this.map.getSource('sensors').setData(
      {
        type: 'FeatureCollection',
        features: sensorsGeoPoints
      }
    );
  }

  private createEmployeeMarker(lng: number, lat: number, zLevel: number): void {
    const oneOrZero = Math.random() > 0.5 ? 1 : 0;

    const employeeMarkerData = {
      imageUrl: ['/assets/man-icon.png', '/assets/woman-icon.png'][oneOrZero],
      width: 20,
      height: 20,
      offset: [0, -20],
      lngLat: {lng, lat}
    };

    const el = document.createElement('img');
    el.src = employeeMarkerData.imageUrl;
    el.style.width = employeeMarkerData.width + 'px';
    el.style.height = employeeMarkerData.height + 'px';

    new Mazemap.ZLevelMarker(el, {
      zLevel,
      offset: employeeMarkerData.offset,
      offZOpacity: 0,
    })
      .setLngLat(employeeMarkerData.lngLat)
      .addTo(this.map);
  }
}
