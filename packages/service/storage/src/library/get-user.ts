export type GetUserInput = {
  user_id?: string;
  email?: string;
};

export async function getUser(input: GetUserInput): Promise<string> {
  if (input.user_id) {
    return input.user_id;
  }

  return '';
}
