export const buildError = (statusCode: number, message: string): Error => {
  return new Error(JSON.stringify({ statusCode, message })); 
};
