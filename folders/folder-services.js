const FolderService = {
    //Grabs each piece of data with all the columns, the data provided
    getAllFolders(knex) {
        return knex.select('*').from('noteful_folders')
    },

    //  grabs all data that match the information provided. Here we are looking for id but we could
    //choose to search by something else
    getById(knex, id) {
        return knex.from('noteful_folders').select('*').where('id', id).first()
    },

    //  Uses the provided name for the folder and adds 
    insertFolder(knex, newFolder) {
    return knex
        .insert(newFolder)
        .into('noteful_folders')
        .returning('*')
        .then(rows => {
        return rows[0]
        })
    }
}


module.exports = FolderService