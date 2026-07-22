const ZOOM_ACCOUNT_ID="K161d9oCQH-ut2b4Jgj1FQ";
const ZOOM_CLIENT_ID="DivExZdmSIeFfWR4DQeNhw";
const ZOOM_CLIENT_SECRET="azP73ISf3c0wLEVQ695SmSUxCQlgQtKU";

const testZoom = async () => {
  try {
    const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    console.log("Requesting token...");
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      }
    });
    
    const data = await response.json();
    console.log("Response:", data);
  } catch (e) {
    console.error(e);
  }
};

testZoom();
