export interface UserData {
  waitingForLongUrl: boolean;
  waitingForCustomizeUrl: boolean;
  waitingForLongUrlForCutomizeUrl: boolean;
  customCode: string;
  urlGenerated: boolean;
  restart: boolean;
  end: boolean;
}

export type Storage = { [key: number]: UserData };
