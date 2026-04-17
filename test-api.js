const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:4000/api/reports');
    console.log('SUCCESS:', res.data);
  } catch (e) {
    console.log('ERROR:', e.message);
    if (e.response) {
      console.log('DATA:', e.response.data);
      console.log('STATUS:', e.response.status);
    }
  }
}

test();
