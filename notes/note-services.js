const NoteService = {
    //Grabs each piece of data with all the columns, the data provided
    getAllNotes(knex) {
        return knex.select('*').from('noteful_notes')
    },

    //  grabs all data that match the information provided. Here we are looking for id but we could
    //choose to search by something else
    getById(knex, id) {
        return knex.from('noteful_notes').select('*').where('id', id).first()
    },

    getAllByFolderId(knex, folder_id) {
        return knex.select('*').from('noteful_notes').where('folder_id', folder_id)
    },

    insertNote(knex, newArticle) {
    return knex
        .insert(newArticle)
        .into('noteful_notes')
        .returning('*')
        .then(rows => {
        return rows[0]
        })
    },

    deleteNote(knex, id) {
    return knex('noteful_notes')
        .where({ id })
        .delete()
    },
    
    updateNote(knex, id, newNoteField) {
    return knex('noteful_notes')
        .where({ id })
        .update(newNoteField)
    },
}


module.exports = NoteService