export class ApiResponse {
    message: string;
    success: boolean;
    data: any;
    timestamp: string;

    constructor(message: string, data: any, success = true) {
        this.message = message;
        this.data = data;
        this.success = success;
        this.timestamp = new Date().toISOString();
    }
}