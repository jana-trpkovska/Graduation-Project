import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

const getAccessToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.access_token || null;
};

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post('http://localhost:8000/refresh', { token: refreshToken });
                const newAccessToken = res.data.access_token;

                const user = JSON.parse(localStorage.getItem('user')) || {};
                const updatedUser = { ...user, access_token: newAccessToken };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                localStorage.setItem('access_token', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
