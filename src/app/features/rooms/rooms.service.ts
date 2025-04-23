export interface IRoom {
  _id?: any;
  name: string;
  room_number: string;
  room_type: string;
  capacity: number;
  price_per_night: number;
  description?: string;
  amenities?: string[];
  status: 'available' | 'occupied' | 'maintenance';
  images?: string[];
  created_at?: Date;
  updated_at?: Date;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = 'http://localhost:3100/api/rooms';
  private readonly http = inject(HttpClient);

  getRooms(filters?: any): Observable<{ data: IRoom[]; count: number }> {
    return this.http.get<{ data: IRoom[]; count: number }>(this.apiUrl, {
      params: filters,
    });
  }

  getRoom(id: number): Observable<{ data: IRoom }> {
    return this.http.get<{ data: IRoom }>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: IRoom): Observable<IRoom> {
    return this.http.post<IRoom>(this.apiUrl, room);
  }

  updateRoom(id: number, room: IRoom): Observable<IRoom> {
    return this.http.patch<IRoom>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}