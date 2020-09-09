import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserData} from './user-data.interface';
import {Observable, of} from 'rxjs';
import {users} from './users';
import {sensors} from './sensors';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly USERS_API_PATH = '/api/users';
  private readonly SENSORS_API_PATH = '/api/sensors';

  constructor(private httpClient: HttpClient) {
  }

  getUsers(): Observable<UserData[]> {
    // return this.httpClient.get<UserData[]>(this.USERS_API_PATH);
    return of(users);
  }

  getUser(uuid: string): Observable<UserData> {
    // return this.httpClient.get<UserData>(`${this.USERS_API_PATH}/${uuid}`);
    const user = users.find(u => u.uuid === uuid);
    return of(user);
  }

  getSensors(): Observable<any[]> {
    // return this.httpClient.get<any[]>(this.SENSORS_API_PATH);
    return of(sensors);
  }
}
