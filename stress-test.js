import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10000,
  duration: '10s',
};

export default function () {
  const res = http.post('http://localhost:30001/notifications', JSON.stringify({
  "message": "Heey there!!!"
}
), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time is < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1); // Optional: pause between iterations
}