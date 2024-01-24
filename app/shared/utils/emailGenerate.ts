export function generateRandomEmail(email: string): string {
  function generateRandomString() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  const timestamp = Date.now();
  const randomString = generateRandomString();
  const resultString = `${timestamp}${randomString}-block-${email}`;

  return resultString;
}
