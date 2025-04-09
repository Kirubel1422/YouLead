import { IProfile } from "src/interfaces/user.interface";

export class Helper {
  constructor() {
    this.extractFullName = this.extractFullName.bind(this);
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
}
