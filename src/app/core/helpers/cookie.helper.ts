export class cookieHelper {
  public _setCookie(token: string, user: string, name: string, position: string): void {
    document.cookie = `session_key=${token};path=/`;
    document.cookie = `usuario=${user};path=/`;
    document.cookie = `nombre=${name};path=/`;
    document.cookie = `cargo=${position};path=/`;
  }

  public getName(): string {
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c.indexOf('nombre=') === 0) {
        return c.substring(7);
      }
    }
    return 'EMPLEADO IHTT NOMBRE';
  }

  public getPosition(): string {
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c.indexOf('cargo=') === 0) {
        return c.substring(6);
      }
    }
    return 'CARGO IHTT';
  }

  public getUsername(): string {
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c.indexOf('usuario=') === 0) {
        return c.substring(8);
      }
    }
    return 'USUARIO IHTT';
  }

  public dataToSend(data: any): any {
    return {
      ...data,
      Sistema_Usuario: this.getUsername()
    };
  }
}
