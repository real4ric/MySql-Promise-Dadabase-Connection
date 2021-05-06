//Imports de l'application
//Express: framework http permet la creation des routes
//intercepte la requet http et envoi une reponse http

const express = require('express');

//CORS : Autorise les requetes provenant d'autres domaines
//Cross Origin Request Sharing
const cors = require('cors');

//Recuperation des donnes envoyees avec la methode POST
const bodyParser = require('body-parser');

//Connection au serveur MySQL et execution des requetes
const mysql = require('mysql2/promise');


//une variable qui stocke la connexion a la BD
let connection;


//Une fonction qui etablie la connexion
const connectToDatabase = async () => {
    connection = await mysql.createConnection({
        host: 'localhost', user: 'root', database: 'sql'
    });
}

//Une fonction qui gere la reponse http apres une requete 
//soit on a un resultat alors on envoie une reponse 200
//soit aucun resultats alors reponse 404
const getResponse = (response, rows, single = false) => {
    if (rows.length > 0) {
        if (single) rows = rows[0];
        response.status(200).json({ ok: true, data: rows });
    } else {
        response.status(404).json({ok: false, message: 'Aucun résultat'})
    }
}

//Creation de l'application express
const app = express();


//Middleware CORS ajout de s infos dans l'en tete http
app.use(cors());

// Middleware que recupere les donnes postees
// et lest stock dans request.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*********************
 Defination des routes
**********************/

app.get('/produit', async (request, response) => {
    const data = await connection.execute('SELECT * FROM vue_details_produits');
    getResponse(response, data[0]);
    
});
app.get('/produit/:id', async (request, response) => {
    const data = await connection.execute(
        'SELECT * FROM vue_details_produits WHERE id= ?',
        [request.params.id]
    );
    getResponse(response, data[0], true);   
});

app.post('/produit', async (request, response) => {
    try {
        const sql = 'INSERT INTO produits SET ?';

        productData = {
            nom: request.body.nom,
            prix: request.body.prix || 0,
            description: request.body.descrption || '',
            id_categorie: request.body.id_categorie
        }
        
        const result = await connection.query(sql, productData);
        response.status(200).json(result[0]);

    } catch (err) {
        response.status(500).json({ ok: false, error: err})
    }
    
});

app.get('/categorie', async (request, response) => {
    const data = await connection.execute('SELECT * FROM categories');
    getResponse(response, data[0]);  
});



//Lancement de l'application
app.listen(3000, async () => {
    console.log('app started');
    await connectToDatabase();
});
