require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./productModel');


const app = express();
app.use(express.json());
// Connexion MongoDB

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connectection reussi à MongoDB'))
.catch((err) => console.error(' Erreur MongoDB:', err));

// Route GET pour recuperer tous le produit de la base

app.get('/products', async (req, res) => {
   try{ const products = await Product.find();  
    res.json(products); 
   }  catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
  });
  

// Routes GET par son id

app.get("/products/:id", async (req, res) => {
  const id = req.params.id;

  const product = await Product.findById(id); // .find({_id: studentId})

  if (!product) {
    res.status(404).send({
      message: "Student not found.",
    });
    return;
  }

  res.send({ product });
});

// Route POST /products
app.post('/products', async (req, res) => {
    try {
      const { productName, price, stockStatus } = req.body;
      const product = new Product({ productName, price, stockStatus });
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: 'Erreur lors de la création' });
    }
  });

  // Route PATCH /products/:id (sans changer stockStatus)
app.patch('/products/:id', async (req, res) => {
    try {
      const { productName, price } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
  
      if (productName) product.productName = productName;
      if (price !== undefined) product.price = price;
  
      await product.save();
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: 'Erreur de mise à jour' });
    }
  });

  // Route PATCH /products/:id/:status (mise à jour du stockStatus)
app.patch('/products/:id/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const allowedStatuses = ['en stock', 'petite stock', 'pas en stock'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockStatus: status },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Erreur de mise à jour du stock' });
  }
});

// Route DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ error: 'Erreur de suppression' });
  }
});


// Démarrage du serveur
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Serveur lancé sur le port :${port}`);
});