export interface APIErrorResponse {
  success: false;
  error: {
    message: string;
    details: string;
    code: number;
    hint?: string;
  };
}

export interface APISuccessResponse {
  success: true;
  message: string;
  data?: any;
}
