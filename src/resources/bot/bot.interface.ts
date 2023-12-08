export interface UserData {
  waitingForLongUrl: boolean;
  waitingForCustomizeUrl: boolean;
  waitingForLongUrlForCustomizeUrl: boolean;
  customCode: string;
}

export type Storage = { [key: number]: UserData };
