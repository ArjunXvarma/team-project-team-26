export interface AuthAPIResponse {
  id?: number;
  name?: String;
  error?: String;
  return_code: 0 | 1;
  access_token?: String;
  session_token?: String;
}

export interface CheckAdminAPIResponse {
  status: number;
  isAdmin: boolean;
  access_token: String;
}

export interface GetUserPrivacyAPIResponse {
  status: number;
  account_type: boolean;
}

export interface CreateJourneyAPIResponse {
  message: String;
  status: 201 | 400;
}

export interface GetJourneyAPIResponse {
  message?: String;
  data?: Journey[];
  status: 200 | 404;
}

export interface FriendsJourneysAPIResponse {
  status: any;
  data: Journey[];
  message: string;
}

export interface Journey {
  id: number;
  name: String;
  endTime: String;
  startTime: String;
  dateCreated: String;
  totalDistance: number;
  type: "Walk" | "Run" | "Cycle";
  elevation: { avg: number; min: number; max: number };
  points: { lat: number; lon: number; ele: number }[];
}
