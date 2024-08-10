export function validateEnvVars(...vars: string[]) {
  vars.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing env var ${variable}`);
    }
  });
}
