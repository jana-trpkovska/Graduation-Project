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


const drugService = {
    getPopularDrugs,
    getAllDrugs,

};

export default drugService;