import { useEffect, useState } from 'react';

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
const key = process.env.NEXT_PUBLIC_ANONYMOUS_KEY;

type ApiResponse = { message: string };

async function loadFromWebApi(): Promise<ApiResponse> {
  const res = await fetch(`${webUrl}/test?apikey=${key}`);
  return await res.json();
}

export default function IndexPage(): JSX.Element {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFromWebApi()
      .then((res) => setMessage(res.message))
      .catch((err) => {
        setMessage(err.message);
      });
  }, []);

  return (
    <div>
      hello world
      <div>This is what the api said: {message ?? 'Loading...'}</div>
    </div>
  );
}
