// Ex- query : { page: '20', name: 'Manav' }
const getPagination = (query) => {
    const page = Math.abs(query.page) || 1; // default page = 1 if we didn't pass it in query endpoint
    const limit = Math.abs(query.limit) || 0; // // default limit = 0 , coz mongodb get all data if limit is 0.
    const skip = (page - 1) * limit;

    return {
        skip,
        limit
    };
};

module.exports = {
    getPagination
}