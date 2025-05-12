import dayjs from "dayjs";
import { IProfile } from "src/interfaces/user.interface";

export class Helper {
  constructor() {
    this.extractFullName = this.extractFullName.bind(this);
    this.fillTimeStamp = this.fillTimeStamp.bind(this);
    this.formatStandardDate = this.formatStandardDate.bind(this);
  }

  extractFullName(profile: IProfile) {
    const { firstName, lastName } = profile;
    const fullName = `${firstName + lastName ? lastName : ""}`;
    return fullName;
  }

  fillTimeStamp() {
    return {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  formatStandardDate(dateString: string) {
    return dayjs(dateString).format("YYYY-MM-DD");
  }
}
