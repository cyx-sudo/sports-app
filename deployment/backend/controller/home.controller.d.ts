export declare class HomeController {
    home(): Promise<string>;
    health(): Promise<{
        status: string;
        timestamp: string;
        service: string;
    }>;
}
