import { GlobalLogger } from "@/logger/logger.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { catchError, firstValueFrom, map, retry, throwError } from "rxjs";

@Injectable()
export class LocationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: GlobalLogger,
  ) { }

  /**
   * 
   * @param ip 
   * @returns 
   * {
      ip: '113.108.81.189',
      city: 'Shenzhen',
      region: 'Guangdong',
      country: 'CN',
      loc: '22.5455,114.0683',
      org: 'AS4134 CHINANET-BACKBONE',
      postal: '518000',
      timezone: 'Asia/Shanghai',
      readme: 'https://ipinfo.io/missingauth'
     }
   */
  async getLocationFromIp(ip: string): Promise<string> {
    try {
      const request$ = this.httpService
        .get(`https://ipinfo.io/${ip}/json`)
        .pipe(
          retry({
            count: 3,
            delay: 1500,
            resetOnSuccess: true,
          }),
          map(response => response.data),
          catchError(error => {
            return throwError(() => new Error(`Request billing api error: ${error.message}`));
          }),
        );
      const locationInfo = await firstValueFrom(request$);
      return `${locationInfo.country} > ${locationInfo.region} > ${locationInfo.city} (${locationInfo.ip})`;
    } catch (error) {
      this.logger.log('Unable to fetch location info');
      return '';
    }
  }

}
