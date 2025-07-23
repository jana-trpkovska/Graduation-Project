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

const drugService = {
    getPopularDrugs,
};

export default drugService;