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

const getAllDrugs = async () => {
    try {
        const response = await axios.get('/drugs');
        return response.data;
    } catch (error) {
        console.error("Error fetching all drugs:", error);
        throw error;
    }
};

const drugService = {
    getPopularDrugs,
    getAllDrugs,

};

export default drugService;