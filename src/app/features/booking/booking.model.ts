export interface IBaseEntity {
  _id?: any; // auto generate by mongo db
  created_by?: string; // _id of the identity or the system
  changed_by?: string; // _id of the identity or the system
  created_on?: Date; // set date.now() when initiate
  last_modified_on?: Date; // set date.now() when modified
  is_delete?: boolean; // check wether document is deleted or not
}

export interface IBooking extends IBaseEntity {
  customer_name: string;
  mobile_number: string;
  clock_in: Date;
  clock_out: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  note: string;
}
