export interface StoreCustomer {
  id: string;
  store_id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  store_slug?: string;
  store_name?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: "home" | "office" | "other";
  recipient_name: string;
  phone: string;
  street_address: string;
  city: string;
  province?: string;
  postal_code?: string;
  is_default: boolean;
}

export interface CustomerAuthState {
  customer: StoreCustomer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
