import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthenticationService {
  constructor(private readonly configService: ConfigService) {}

  async authenticateUser(bearerToken: string): Promise<any> {
    const ssoBaseUrl = this.configService.get<string>('SSO_BASE_URL');
    const ssoClientKey = this.configService.get<string>('SSO_CLIENT_KEY');
    const ssoClientSecret = this.configService.get<string>('SSO_CLIENT_SECRET');

    if (!ssoBaseUrl || !ssoClientKey || !ssoClientSecret) {
      throw new Error('Missing SSO configuration values');
    }

    const response = await axios.post(
      `${ssoBaseUrl}/auth/authenticate-user`,
      undefined,
      {
        headers: {
          'client-id': ssoClientKey,
          'api-key': ssoClientSecret,
          authorization: bearerToken,
        },
      },
    );

    console.log('SSO Authentication Response:', response.data);

    return response.data.data;
  }
}

