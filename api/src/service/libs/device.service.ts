import { Injectable } from "@nestjs/common";
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    deviceVendor: string;
    deviceModel: string;
}

@Injectable()
export class DeviceService {
    getDeviceInfo(userAgent: string): DeviceInfo {
        const parser = new UAParser();
        const result = parser.setUA(userAgent).getResult();

        return {
            browser: result.browser.name || 'Unknown',
            browserVersion: result.browser.version || 'Unknown',
            os: result.os.name || 'Unknown',
            osVersion: result.os.version || 'Unknown',
            deviceType: result.device.type || 'desktop',
            isMobile: result.device.type === 'mobile',
            isTablet: result.device.type === 'tablet',
            isDesktop: !result.device.type || result.device.type === 'desktop',
            deviceVendor: result.device.vendor || '',
            deviceModel: result.device.model || '',
        };
    }

    // check is mobile
    isMobile(userAgent: string): boolean {
        const result = this.getDeviceInfo(userAgent);
        return result.isMobile;
    }

    // check is bot
    isBot(userAgent: string): boolean {
        const result = this.getDeviceInfo(userAgent);
        // 常见的机器人标识
        const botPatterns = [
            'bot', 'crawler', 'spider', 'slurp', 'search', 'fetch',
            'googlebot', 'bingbot', 'duckduckbot', 'baiduspider'
        ];

        const browserName = result.browser.toLowerCase() || '';
        return botPatterns.some(pattern => browserName.includes(pattern));
    }

    getOSInfo(userAgent: string): { name: string; version: string; } {
        const result = this.getDeviceInfo(userAgent);

        return {
            name: result.os,
            version: result.osVersion,
        };
    }
}