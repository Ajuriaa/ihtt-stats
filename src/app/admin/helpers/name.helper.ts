export class NameHelper {
  public getShortName(fullName: string): string {
    const names = fullName.split(" ");

    const firstName = names[0];
    const lastName = names[names.length - 2];

    const shortFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const shortLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    const shortName = `${shortFirstName} ${shortLastName}`;

    return shortName;
  }
}
