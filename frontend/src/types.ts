export interface AuthAPIResponse {
  id?: number;
  name?: string;
  error?: string;
  return_code: 0 | 1;
  access_token?: string;
  session_token?: string;
}
