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

const getDrugById = async (id) => {
    try {
        const response = await axios.get(`/drugs/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching drug with ID ${id}:`, error);
        throw error;
    }
};

const incrementPopularity = async (id) => {
    try {
        await axios.post(`/drugs/${id}/increment-popularity`);
    } catch (error) {
        console.error("Error incrementing popularity:", error);
    }
};

const getDrugSuggestions = async (query) => {
    const response = await axios.get('/drugs', { params: { query } });

    return response.data.map(drug => ({
        id: drug.id,
        name: drug.name,
    }));
};

const getMyDrugs = async () => {
    const response = await axios.get('/users/me/drugs');
    return response.data;
};

const addDrugToUser = async (drugId, usage = '') => {
    const response = await axios.post('/users/me/drugs', {
        drug_id: drugId,
        usage: usage,
    });
    return response.data;
};

const removeDrugFromUser = async (drugId) => {
    await axios.delete(`/users/me/drugs/${drugId}`);
};

const drugService = {
    getPopularDrugs,
    getAllDrugs,
    signUp,
    login,
    getDrugById,
    incrementPopularity,
    getDrugSuggestions,
    getMyDrugs,
    addDrugToUser,
    removeDrugFromUser,

};

export default drugService;