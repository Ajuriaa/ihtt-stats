export class FileNameHelper {
  public getFileName(data: string, file: File): string {
    const extension = file.name.split('.').pop();
    return `${data}-${Math.random().toString(36).substring(4)}.${extension}`;
  }
}
