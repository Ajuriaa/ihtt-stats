export class NameHelper {
  public transformFullName(names: string): string {
    const parts = names.trim().split(/\s+/);

    if (parts.length < 2) {
        return names;
    }

    return `${parts[0]} ${parts[parts.length - 2]}`;
  }
}
