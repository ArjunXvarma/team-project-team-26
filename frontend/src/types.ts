export interface CurrentMembership{
  membership_type: String,
  membership_duration: String,
  mode_of_payment: String,
  start_date: String,
  end_date: String,
  auto_renew: boolean,
}

export interface MembershipData {
  MembershipDuration: string[];
  MembershipType: string[];
  MembershipPriceMonthly: string[];
  MembershipPriceAnnually: string[];
}

export interface Friend {
  name: string;
  email: string;
}

export interface JourneyData {
  averageSpeed: number;
  date: number;
  caloriesBurned: number;
  hours_taken: number;
  journeyId: number;
  minutes_taken: number;
  mode: string;
  seconds_taken: number;
  totalDistance: number;
}

export interface StatsData {
  byModes: {
    cycle: {
      totalCaloriesBurned: number;
      totalDistance: number;
      totalTimeWorkingOutHours: number;
      totalTimeWorkingOutMinutes: number;
      totalTimeWorkingOutSeconds: number;
    };
    running: {
      totalCaloriesBurned: number;
      totalDistance: number;
      totalTimeWorkingOutHours: number;
      totalTimeWorkingOutMinutes: number;
      totalTimeWorkingOutSeconds: number;};
    walking:{
      totalCaloriesBurned: number;
      totalDistance: number;
      totalTimeWorkingOutHours: number;
      totalTimeWorkingOutMinutes: number;
      totalTimeWorkingOutSeconds: number;};
  };
  journeysData: JourneyData[]; 
  totalCaloriesBurned: number;
  totalDistanceCombined: number;
  totalTimeWorkingOutHours: number;
  totalTimeWorkingOutMinutes: number;
  totalTimeWorkingOutSeconds: number;
}

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

export interface FutureRevenuePredictionAPIResponse {
  data: {
    period: String;
    future_revenues: number[];
  };
  status: number;
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

export interface Revenue {
  period: string;
  total_sold: number;
  total_revenue: number;
  by_type: {
    Basic?: {
      total_sold: number;
      total_revenue: number;
    };
    Standard?: {
      total_sold: number;
      total_revenue: number;
    };
    Premium?: {
      total_sold: number;
      total_revenue: number;
    };
  };
}
