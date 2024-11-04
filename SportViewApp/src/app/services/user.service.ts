import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api, routes } from 'src/environments/environment';
import { LoginCredentials, RegisterCredentials, User } from '../models/users.models';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUsersRoute: string = api.backend+routes.users;

  currentUser?: User;

  headers: HttpHeaders;

  constructor(private http: HttpClient) { 
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
  }

  setToken(token: string) {
    console.log("[user service - setToken] token: "+token);
    localStorage.setItem('auth_token', token);
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
  }

  createNewUser(user: RegisterCredentials): Observable<User> {
    return this.http.post<User>(this.apiUsersRoute, user);
  }

  login(loginCredentials: LoginCredentials): Observable<User> {
    return this.http.post<User>(this.apiUsersRoute+'login/', loginCredentials).pipe(
      tap((response: any) => {
        this.setToken(response.access_token);
        this.currentUser = response;
      })
    );
  }

  verifyToken(): Observable<boolean> {
    const headers = this.headers;
    return this.http.get(this.apiUsersRoute+'verify-token/', { headers }).pipe(
      map(() => true),
      catchError(() => of(false))
    )
  }
}
