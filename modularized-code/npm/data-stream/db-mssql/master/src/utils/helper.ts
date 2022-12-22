class Helper {

  public makeidTimestamp() {
    let result = "";
    const length: number = 5;
    // const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const numbers = Math.floor(Date.now() / 1000);
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + numbers;
  }

  public getPagination(page: number, size: string | number, defaultSize: number) {
    const limit: number = size ? +size : defaultSize;
    const offset: number = page ? page * limit : 0;
    return { limit, offset };
  }

}
export const helper = new Helper();

