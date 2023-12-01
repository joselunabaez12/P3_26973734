const express = require('express');
const router = express.Router();
const Sqlite3 = require("sqlite3").verbose();
const path = require('path');
const { Database } = require('sqlite3');
const db = path.join(__dirname, "/db", "database.db");
require('dotenv').config()
const dataBase = new Sqlite3.Database(db, (err) => {
  console.log('Database created')
});


const images = "CREATE TABLE images (id INTEGER PRIMARY KEY AUTOINCREMENT,producto_id INTEGER NOT NULL,url TEXT NOT NULL,destacado BOOLEAN NOT NULL,FOREIGN KEY (producto_id) REFERENCES productos (id));"
const category = "CREATE TABLE categorys (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL);";
const products = "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL,codigo TEXT NOT NULL,precio NUMERIC NOT NULL,software TEXT NOT NULL,estado TEXT NOT NULL,descripcion TEXT NOT NULL,categoria_id INTEGER NOT NULL,FOREIGN KEY (categoria_id) REFERENCES categorias (id))";

dataBase.run(images, err => {
  err ? err : console.log('img')
})


dataBase.run(category, err => {
  err ? err : console.log('category')
})


dataBase.run(products, err => {
  err ? err : console.log('products')
})





/* GET home page. */
router.get("/dashboard", (req, res) => {
  dataBase.all(`SELECT * FROM products`, [], (err, products) => {
    dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
      dataBase.all(`SELECT * FROM images`, [], (err, images) => {
        res.render('dashboard', {
          p: products,
          c: categorys,
          img: images
        })
      })
    })
  })
})


router.get("/client", (req, res) => {
  dataBase.all(`SELECT * FROM products`, [], (err, products) => {
    dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
      dataBase.all(`SELECT * FROM images`, [], (err, images) => {
        res.render('client', {
          p: products,
          c: categorys,
          img: images
        })
      })
    })
  })
})


router.get("/client/:id", (req, res) => {
  const { id } = req.params;
  dataBase.get(`SELECT * FROM products WHERE id = ?`, id, (err, products) => {
    dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
      dataBase.get(`SELECT * FROM images WHERE producto_id = ?`, id, (err, images) => {
        res.render('productView', {
          p: products,
          c: categorys,
          img: images
        })
      })
    })
  })
})




router.get('/product', (req, res) => {
  dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    res.render('product', {
      c: categorys,
    })
  })
})

router.post('/product', (req, res) => {
  const { name, code, price, software, state, description, category } = req.body;
  dataBase.all(`INSERT INTO products(nombre,codigo,precio,software,estado,descripcion,categoria_id) VALUES (?,?,?,?,?,?,?)`,
    [name, code, price, software, state, description, category], (err) => {
      err ?
        console.log(err)
        :
        dataBase.all(`INSERT INTO images(producto_id,url,destacado) VALUES (?,?,?)`, ['', '', 1], (err) => {
          err ?
            console.log(err)
            :
            res.redirect('/dashboard');
        })
    })
})

router.get('/edit_product/:id', (req, res) => {
  const { id } = req.params;
  dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    dataBase.get(`SELECT * FROM products WHERE id = ?`, id, (err, prod) => {
      if (err) {
        console.log(err)
      } else {
        res.render('product_edit', {
          c: categorys,
          rowProduct: prod
        })
      }
    })
  })
})

router.post('/edit_product/:id', (req, res) => {
  const { id } = req.params;
  const { name, code, price, software, state, description, category } = req.body;
  dataBase.run(`UPDATE products SET nombre = ?,codigo = ?,precio = ?,software = ?,estado = ?,descripcion = ?,categoria_id = ? WHERE id = ?`,
    name, code, price, software, state, description, category, id, err => {
      err ?
        console.log(err)
        :
        res.redirect('/dashboard');
    })
})


router.get('/deleteproduct/:id',(req,res) => {
  const { id } = req.params;
  const sqlQuery = "DELETE FROM products WHERE id = ?";
  dataBase.run(sqlQuery,id,(err,query) => {
    res.redirect('/dashboard')
  })
})



router.get('/category', (req, res) => {
  dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    res.render('category', {
      c: categorys,
    })
  })
})

router.post('/category', (req, res) => {
  const { category } = req.body;
  dataBase.run(`INSERT INTO categorys(nombre) VALUES(?)`, [category], err => {
    err ?
      console.log(err)
      :
      res.redirect('/dashboard');
  })
})


/*Get category for id*/

router.get('/category/:id', (req, res) => {
  const { id } = req.params;
  const sqlCategory = "SELECT * FROM categorys";
  const sqlQuery = "SELECT * FROM products WHERE categoria_id = ?";
  const sqlImg = "SELECT products.*, images.url FROM products LEFT JOIN images ON products.id = images.producto_id WHERE products.categoria_id = ?";
  dataBase.all(sqlCategory, [], (err, categorys) => {
    dataBase.all(sqlQuery, id, (err, prod) => {
      dataBase.all(sqlImg, id, (err, img) => {
        console.log(img)
          res.render('client',{
            p: prod,
            c: categorys,
            img: img
          })
      })
    })
  })
})


router.post('/client/filter', (req,res) => {
  const { name, state, software, description } = req.body;
  const sqlImg = "SELECT products.*, images.url FROM products LEFT JOIN images ON products.id = images.producto_id WHERE products.nombre = ? OR products.software = ? OR products.estado = ?";
  const sqlCategory = "SELECT * FROM categorys";
  const search = [name,software,state]
  dataBase.all(sqlCategory,[],(err,categorys) => {
      dataBase.all(sqlImg,search,(err,img) => {
        console.log('Imagen: ',img)
        res.render('client',{
            p: img,
            c: categorys,
            img: img
        })
      })
    })
  })






router.get('/editcategory', (req, res) => {
  dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    res.render('category_edit', {
      c: categorys,
    })
  })

})

router.post('/editcategory/:id', (req, res) => {
  const { id } = req.params;
  const { category } = req.body;
  dataBase.run(`UPDATE categorys SET nombre = ? WHERE (id = ?)`, category, id, err => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/dashboard')
    }
  })
})


router.get('/addimage/:id', (req, res) => {
  const { id } = req.params;
  dataBase.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    dataBase.all(`SELECT * FROM products WHERE id = ?`, id, (err, products) => {
      res.render('image', {
        c: categorys,
        p: products
      })
    })
  })
})


router.post('/addimage/:id', (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  dataBase.run(`UPDATE images SET producto_id = ?, url = ?, destacado = ? WHERE id = ?`, [id, url, 1, id], (err) => {
    err ?
      console.log(err)
      :
      res.redirect('/dashboard');
  })
})


router.get('/', (req, res) => {
  res.render('index');
})


router.post('/login', (req, res) => {
  const { user, password } = req.body;
  if (user == process.env.USER && password == process.env.PASSWORD) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }

})
module.exports = router;
