import { Reader, ReaderModel } from '@maxmind/geoip2-node';
export type Geolocation = {
    latitude: number;
    longitude: number;
};
export interface LocationDBInterface {
    getLocationBasedOnIPAddress: (ipAddress: string) => Geolocation;
}

export class LocationDB implements LocationDBInterface {
    private reader?: ReaderModel;
    constructor() {
        try {
             Reader.open('geodata/GeoLite2-City.mmdb').then(reader => {
                this.reader = reader;
            });
        } catch (error: any) {
            throw new Error(error);
        }
    }
    getLocationBasedOnIPAddress = (ipAddress: string): Geolocation => {
        if(!this.reader) {
            throw new Error('Reader not initialized');
        }
        const city =  this.reader.city(ipAddress);

        if(!city.location) {
            throw new Error('Location not found');
        }
        return {
            latitude: city.location?.latitude,
            longitude: city.location?.longitude
        }
    }
}    