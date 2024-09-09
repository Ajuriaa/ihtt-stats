import { inject } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';

export const authGuard = (state: RouterStateSnapshot) => {
  const router: Router = inject(Router);

  if (findToken()) {
    return true;
  }

  router.navigate(['/'], { queryParams: { returnUrl: state.url } });
  return true;
};

function findToken(): boolean {
  const cookies = document.cookie.split('; ');
  let hasToken = false;
  let hasName = false;
  for (const c of cookies) {
    if (c.includes('session_key=')) {
      hasToken = true;
    }
    if(c.includes('nombre=')) {
      hasName = true;
    }
  }

  return hasToken && hasName;
}


