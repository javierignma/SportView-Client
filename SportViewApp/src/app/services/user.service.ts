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

  saveUser(user: User) {
    const data = JSON.stringify(user);
    localStorage.setItem('user_data', data);
  }

  removeCurrentUser() {
    localStorage.removeItem('user_data');
  } 

  getUserByEmail(email: string) {
    const headers = this.headers;
    this.http.get<User>(this.apiUsersRoute+'email/'+email, { headers }).subscribe(
      (res) => {
        this.saveUser(res);
      },
      (error) => {
        console.log("An error has ocurred: "+error);
      }
    )
  }

  getCurrentUser(option: string): string {
    const userData = localStorage.getItem('user_data');
    const currentUser = userData ? JSON.parse(userData) : undefined;
    
    switch (option) {
      case 'first_name':
        return currentUser.first_name;
      case 'last_name':
        return currentUser.last_name;
      case 'full_name':
        return currentUser.first_name+' '+currentUser.last_name;
      default:
        return currentUser.email;
    }
    
  }

  login(loginCredentials: LoginCredentials): Observable<User> {
    return this.http.post<User>(this.apiUsersRoute+'login/', loginCredentials).pipe(
      tap((response: any) => {
        this.setToken(response.access_token);
        this.saveUser(response);
      })
    );
  }

  verifyToken(): Observable<any> {
    const headers = this.headers;
    return this.http.get(this.apiUsersRoute+'verify-token/', { headers })
  }
}
