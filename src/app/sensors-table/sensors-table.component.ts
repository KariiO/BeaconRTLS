import {Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {SensorData} from '../data/sensor-data.interface';

@Component({
  selector: 'app-sensors-table',
  templateUrl: './sensors-table.component.html',
  styleUrls: ['./sensors-table.component.scss']
})
export class SensorsTableComponent {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  displayedColumns = ['lng', 'lat', 'zLevel'];
  dataSource: MatTableDataSource<any>;

  @Input() set sensors(s: SensorData[]) {
    const flatSensorsData = s?.map(data => ({...data.coordinates}));
    this.dataSource = new MatTableDataSource<any>(flatSensorsData);
    this.dataSource.paginator = this.paginator;
  }
}
