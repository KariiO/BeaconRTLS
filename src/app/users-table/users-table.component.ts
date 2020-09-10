import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {UserData} from '../data/user-data.interface';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class UsersTableComponent {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @Output() localizeUser = new EventEmitter<string>();
  dataSource: MatTableDataSource<UserData>;
  displayedColumns = ['uuid', 'type', 'firstName', 'lastName'];
  expandedElement: UserData | null;
  _users: UserData[];
  eStarted: boolean;

  @Input() set evacuationStarted(v) {
    this.eStarted = v;
    if (v) {
      this.displayedColumns.push('status');
    }
  }

  @Input() set users(u: UserData[]) {
    this.dataSource = new MatTableDataSource<UserData>(u);
    this._users = u;
    // this.dataSource.paginator = this.paginator;
  }

  get evacuatedPersonsAmount(): number {
    const notInsideUsers = this._users?.filter(user => user.status !== 'INSIDE');
    return notInsideUsers?.length || 0;
  }
}
