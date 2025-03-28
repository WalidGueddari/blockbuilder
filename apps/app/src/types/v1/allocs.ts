export interface Alloc {
  id: string;
  public_address: string;
  private_key: string;
  balance: string;
  networkId: string;
  create_at: string; // or Date
  updated_at: string; // or Date
}
