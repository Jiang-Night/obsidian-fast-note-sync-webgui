let API_URL = localStorage.getItem('API_URL');
const env = {
    API_URL: API_URL ? API_URL : (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:9000'),
    debug: true
};

export default env;