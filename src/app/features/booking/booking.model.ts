export interface IBaseEntity {
  _id?: any; // auto generate by mongo db
  created_by?: string; // _id of the identity or the system
  changed_by?: string; // _id of the identity or the system
  created_on?: Date; // set date.now() when initiate
  last_modified_on?: Date; // set date.now() when modified
  is_delete?: boolean; // check wether document is deleted or not
}

export interface IBooking {
  _id?: any;
  customer_name: string;
  mobile_number: string;
  clock_in: Date;
  clock_out: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  note?: string;
  room_id: any; // Reference to the selected room
  room?: {
    _id: number;
    name: string;
    room_number: string;
    room_type: string;
    price_per_night: number;
  };
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  changed_by?: string;
  last_modified_on?: Date;
}
