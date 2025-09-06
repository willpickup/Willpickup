export interface Officer {
  name: string;
  title: string;
  isProTem: boolean;
}

export interface MeetingDetails {
  lodgeName: string;

  lodgeNumber: string;
  meetingDate: string;
  meetingTime: string;
  meetingType: string;
  minuteTemplate: string;
  degree: string;
  brethrenPresent: string;
  worshipfulMaster: Officer;
  seniorWarden: Officer;
  juniorWarden: Officer;
  treasurer: Officer;
  secretary: Officer;
  seniorDeacon: Officer;
  juniorDeacon: Officer;
  steward1: Officer;
  steward2: Officer;
  tyler: Officer;
}

export interface SavedMinute {
  id: string;
  lodgeName: string;
  lodgeNumber: string;
  meetingDate: string;
  minutes: string;
  savedAt: string;
}

export interface Brother {
  name: string;
  title: string;
}