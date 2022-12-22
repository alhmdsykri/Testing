export class DatabaseCredential {
  private static databaseName: string | null;
  private static host: string | null;
  private static username: string | null;
  private static password: string | null;

  public static set(
    host: string | null,
    username: string | null,
    password: string | null,
    databaseName: string | null
  ) {
    this.databaseName = databaseName;
    this.host = host;
    this.username = username;
    this.password = password;
  }

  public static get() {
    return {
      databaseName: "fms-core-attendance",
      host: this.host,
      username: this.username,
      password: this.password,
    };
  }
}
