import { Routes } from '@angular/router';
import { ViewUsersComponent } from './view-users/view-users.component';
import { CreateEditUsersComponent } from './create-edit-users/create-edit-users.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: ViewUsersComponent,
  },
  {
    path: 'new',
    component: CreateEditUsersComponent,
  },
  {
    path: ':id/edit',
    component: CreateEditUsersComponent,
  },
];
