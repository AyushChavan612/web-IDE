import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },  // Stay at 10 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    code: '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }',
    language: 'cpp',
    input: ''
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  http.post('http://localhost:3000/api/compile', payload, params);
  sleep(1);
}