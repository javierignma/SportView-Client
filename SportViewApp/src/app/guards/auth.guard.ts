import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.verifyToken().pipe(
    map(isValid => {
      if (isValid) {
        console.log(isValid);
        userService.getUserByEmail(isValid.email);
        return true;
      }
      else {
        userService.removeCurrentUser();
        router.navigate(['/login']);
        return false
      }
    }),
    catchError(() => {
      userService.removeCurrentUser();
      router.navigate(['/login']);
      return of(false);
    })
  )
};
