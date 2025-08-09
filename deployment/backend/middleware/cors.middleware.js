"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsMiddleware = void 0;
const core_1 = require("@midwayjs/core");
let CorsMiddleware = class CorsMiddleware {
    resolve() {
        return async (ctx, next) => {
            // 设置CORS头
            ctx.set('Access-Control-Allow-Origin', 'http://localhost:5173');
            ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            ctx.set('Access-Control-Allow-Credentials', 'true');
            // 处理预检请求
            if (ctx.method === 'OPTIONS') {
                ctx.status = 200;
                return;
            }
            await next();
        };
    }
};
CorsMiddleware = __decorate([
    (0, core_1.Middleware)()
], CorsMiddleware);
exports.CorsMiddleware = CorsMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycy5taWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvY29ycy5taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHlDQUE0QztBQUlyQyxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjO0lBQ3pCLE9BQU87UUFDTCxPQUFPLEtBQUssRUFBRSxHQUFZLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2hELFVBQVU7WUFDVixHQUFHLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFDaEUsR0FBRyxDQUFDLEdBQUcsQ0FDTCw4QkFBOEIsRUFDOUIsaUNBQWlDLENBQ2xDLENBQUM7WUFDRixHQUFHLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLDZCQUE2QixDQUFDLENBQUM7WUFDdkUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVwRCxTQUFTO1lBQ1QsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7Z0JBQ2pCLE9BQU87YUFDUjtZQUVELE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQTtBQXJCWSxjQUFjO0lBRDFCLElBQUEsaUJBQVUsR0FBRTtHQUNBLGNBQWMsQ0FxQjFCO0FBckJZLHdDQUFjIn0=