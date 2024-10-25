import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api, routes } from 'src/environments/environment';
import { LoginCredentials, User } from '../models/users.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUsersRoute: string = api.backend+routes.users;

  constructor(private http: HttpClient) { }

  createNewUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUsersRoute, user);
  }

  login(loginCredentials: LoginCredentials): Observable<User> {
    return this.http.post<User>(this.apiUsersRoute+'login/', loginCredentials);
  }
}
