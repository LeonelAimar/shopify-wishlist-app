class ApplicationError extends Error {
    public status: string;
    public type: string;
    public details?: string;
    public code: number;

    constructor(message: string, code: number, type: string, details?: string) {
        super();
        
        Error.captureStackTrace(this, this.constructor);
    
        this.status = 'error';
        
        this.name = this.constructor.name;
    
        if (type) this.type = type;
    
        this.message = message || 'Something went wrong. Please try again.';
        
        this.code = code || 500;
    
        if (details) this.details = details;
    }
}
  
export default ApplicationError;