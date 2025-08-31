import {  useAuthStore } from '../store/auth'

export async function getMaps() {
    return await sendRequest(`/api/data/maps`, 'GET')
}

export async function getMap(mapId) {
    return await sendRequest(`/api/data/maps/${mapId}`, 'GET')
}

export async function getLocations(mapId) {
    return await sendRequest(`/api/data/maps/${mapId}/locations/`, 'GET')
}

export async function getLocation(mapId, locationId) {
    return await sendRequest(`/api/data/maps/${mapId}/locations/${locationId}`, 'GET')
}

export async function updateLocation(mapId, locationId, updateData) {
    return await sendRequest(`/api/data/maps/${mapId}/locations/${locationId}`, 'PUT', updateData)
}

export async function deleteLocation(mapId, locationId) {
    return await sendRequest(`/api/data/maps/${mapId}/locations/${locationId}`, 'DELET', null)
}

export async function sendRequest(path, method, body) {
    try {
        let params = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (useAuthStore().isAuthenticated) {
            const token = localStorage.getItem('token')
            if (token) {
                params.headers['Authorization'] = `Bearer ${token}`
            }
        }
        
        if (body) params.body = JSON.stringify(body);
        const response = await fetch(path, params);

        return await response.json();
    } catch (error) {
        console.error('Error updating location:', error);
        throw error;
    }
}