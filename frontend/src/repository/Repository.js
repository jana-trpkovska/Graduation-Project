import axios from "../custom-axios/axios";

const getPopularDrugs = async () => {
    try {
        const response = await axios.get('/drugs/popular');
        return response.data;
    } catch (error) {
        console.error("Error fetching popular drugs:", error);
        throw error;
    }
};

const getAllDrugs = async ({ query = '', drug_class = '', letter = '' } = {}) => {
    const params = {};
    if (query) params.query = query;
    if (drug_class) params.drug_class = drug_class;
    if (letter) params.letter = letter;

    const response = await axios.get('/drugs', { params });
    return response.data;
};


const signUp = async (username, password) => {
    try {
        const response = await axios.post('/register', {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        console.error("Error during sign-up:", error);
        throw error;
    }
};

const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await axios.post('/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

const drugService = {
    getPopularDrugs,
    getAllDrugs,
    signUp,
    login,

};

export default drugService;