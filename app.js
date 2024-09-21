const express = require('express');
const mongoose = require('mongoose')
const path = require('path')
const favicon = require('serve-favicon')

const app = express();

app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/todolistDb')

const itemsSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Por favor insira um item']
   }
})

const Item = mongoose.model('items', itemsSchema)

const listSchema = new mongoose.Schema({
   name: String,
   items: [itemsSchema]
})

const List = mongoose.model('list', listSchema)

app.get('/', async (req, res) => {

   try {

      const items = await Item.find({})

      res.render('list', {listTitle: "Today", newListItems: items})

   } catch (err) {
      console.error(err)
      res.status(500).json({mensagem: 'Erro ao buscar'})
   }
});

app.post('/', async (req, res) => {

   const itemInput = req.body.newItem
   const listName = req.body.list
   
   if(itemInput) {
      try {
         if(listName === 'Today') {
            const item = new Item({
               name: itemInput
            });
            await item.save()
            res.redirect('/')
         } else {
            const resultList = await List.findOne({name: listName}).exec()
            if(resultList) {
               const item = new Item({
                  name: itemInput
               })
               resultList.items.push(item)
               await resultList.save()
               res.redirect('/' + listName)
            }
         }
      } catch (err) {
         console.error(err)
         res.status(500).json(err)
      }
   } else {
      res.redirect('/')
   }
})

app.post('/delete', async (req, res) => {
   
   const checkboxItemId = req.body.checkbox
   const listName = req.body.listName

   if(listName === 'Today'){
      try {
         const removeItem = await Item.findByIdAndDelete(checkboxItemId)
         res.redirect('/')
      } catch (err) {
         console.error(err)
      }
      
   } else {
      try {
         const removeListName = await List.findOneAndUpdate({ name: listName}, {$pull: {items: {_id: checkboxItemId}}})
         res.redirect('/' + listName)
      } catch (err) {
         console.log('deu erro na lista personalizada', err)
      }
   }
})

//Rota dinamica expressjs

app.get('/:customListName', async (req, res) => {
   const customListName = req.params.customListName

   try {
      const resultList = await List.findOne({name: customListName}).exec()

      if(!resultList) {
         console.log('Não tem lista')
         const list = new List({
            name: customListName,
         })
         list.save()
         res.redirect('/' +  customListName)
      } else {
         res.render('list', {listTitle: resultList.name, newListItems: resultList.items})
      }
   } catch (err) {
      console.log(err)
   }
})

app.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});