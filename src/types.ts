export interface Address {
    province?: string;
    municipality?: string;
    address?: string;
  }
  
  export interface Store {
    name: string;
    hours: string;
    phone: string;
    services: string[];
    latitude: number;
    longitude: number;
    distance: number;
  }

  export interface Place {
    province: string;
    municipality: string;
  }
  
  export interface BarangayList {
    barangay_list: string[];
  }
  
  export interface MunicipalityList {
    [key: string]: BarangayList;
  }
  
  export interface Province {
    municipality_list: MunicipalityList;
  }
  
  export interface ProvinceList {
    [key: string]: Province;
  }
  
  export interface Region {
    region_name: string;
    province_list: ProvinceList;
  }
  
  export interface Places {
    [key: string]: Region;
  }