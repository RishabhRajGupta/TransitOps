export interface SharedErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
