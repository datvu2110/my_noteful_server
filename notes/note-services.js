const ArticlesService = {
    //Grabs each piece of data with all the columns, the data provided
    getAllArticles(knex) {
        return knex.select('*').from('blogful_articles')
    },

    //  grabs all data that match the information provided. Here we are looking for id but we could
    //choose to search by something else
    getById(knex, id) {
        return knex.from('blogful_articles').select('*').where('id', id).first()
    },

    insertArticle(knex, newArticle) {
    return knex
        .insert(newArticle)
        .into('blogful_articles')
        .returning('*')
        .then(rows => {
        return rows[0]
        })
    },

    deleteArticle(knex, id) {
    return knex('blogful_articles')
        .where({ id })
        .delete()
    },
    
    updateArticle(knex, id, newArticleFields) {
    return knex('blogful_articles')
        .where({ id })
        .update(newArticleFields)
    },
}


module.exports = ArticlesService

/*
    updateArticle(knex, id, newArticleFields) {
        return knex('blogful_articles')
            .where({ id })
            .update(newArticleFields)
        },


        
*/