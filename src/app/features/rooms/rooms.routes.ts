import { Routes } from '@angular/router';
import { CreateEditRoomComponent } from './create-edit-rooms/create-edit-rooms.component';
import { ViewRoomsComponent } from './view-rooms/view-rooms.component';

export const ROOM_ROUTES: Routes = [
  {
    path: '',
    component: ViewRoomsComponent,
  },
  {
    path: 'new',
    component: CreateEditRoomComponent,
  },
  {
    path: ':id/edit',
    component: CreateEditRoomComponent,
  },
];