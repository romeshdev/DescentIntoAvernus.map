export async function sendRequest(path, method, body) {
    try {
        let params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        };
        if (body) params.body = JSON.stringify(body);
        const response = await fetch(path, params);

        return await response.json();
    } catch (error) {
        console.error('Error updating location:', error);
        throw error;
    }
}

export async function updateLocation(region, locationId, updateData) {
    return await sendRequest(`/api/data/maps/${region}/hex/${locationId}`, 'PUT', updateData)
}

export async function deleteLocation() {
    return await sendRequest(`/api/data/maps/${region}/hex/${locationId}`, 'DELET', null)
}
