let kinvey = (() => {
    function createEntity(table, dataObject) {
        return remote.post('appdata', table, 'kinvey', dataObject);
    }

    function deleteEntity(table, entityId) {
        return remote.remove('appdata', `${table}/${entityId}`, 'kinvey');
    }

    function getAllEntities(table, query) {
        //example: return all posts sorted by post time, descending
        // const endpoint = 'posts?query={}&sort={"_kmd.ect": -1}';
        return remote.get('appdata', table + query, 'kinvey');
    }

    //sorted by _kmd.ect!
    function getEntitiesFiltered(table, filterColumn, filterValue) {
        const endpoint = `${table}?query={"${filterColumn}":"${filterValue}"}&sort={"_kmd.ect": -1}`;
        console.log(endpoint);
        return remote.get('appdata', endpoint, 'kinvey');
    }

    function getEntityById(table, entityId) {
        return remote.get('appdata', `${table}/${entityId}`, 'kinvey');
    }
    
    function updateEntity(table, entityId, dataObject) {
        return remote.update('appdata', `${table}/${entityId}`, 'kinvey', dataObject);
    }

    return {
        createEntity,
        deleteEntity,
        updateEntity,
        getAllEntities,
        getEntityById,
        getEntitiesFiltered
    }
})();
