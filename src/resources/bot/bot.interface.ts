export interface UserData {
  waitingForLongUrl: boolean;
  waitingForCustomizeUrl: boolean;
  waitingForLongUrlForCutomizeUrl: boolean;
  customCode: string;
}

export type Storage = { [key: number]: UserData };
