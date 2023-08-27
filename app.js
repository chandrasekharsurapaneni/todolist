//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://chanduchowdary30:Chandu123@cluster0.vuayqpl.mongodb.net/todolistDB');

const itemsSchema = {
  name:String,
}
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"welcome to the todo list"
})
const item2 = new Item({
  name:"hit the + button to add a new item"
})
const item3 = new Item({
  name:"hit this to delete this item"
})

let defaultItems=[];
const listSchema = {
  name:String,
  items:[itemsSchema],
}
const List = mongoose.model("List",listSchema);

console.log("successfully saved to the data base");
app.get("/", function(req, res) {
   
if (defaultItems.length===0) {
  defaultItems =[item1,item2,item3];
  Item.insertMany(defaultItems);
}
async function name(){
  const founditems = await Item.find({});// console.log(founditems);
  res.render("list", {listTitle: "Today", newListItems: founditems});
}
name();
});

app.get("/:customListName",async function (req,res) {
  const customListName = _.capitalize(req.params.customListName);
 const temp=await List.findOne({name:customListName});
 if(!temp){
  const list = new List({
    name:customListName,
    items:defaultItems
  })
  await list.save();
  res.redirect("/" + customListName);
 }
 else{
  res.render("list.ejs",{listTitle:temp.name,newListItems:temp.items});
 }
  
});

app.post("/", function(req, res){  
  async function name(params) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name :itemName
    });
    if (listName==="Today") {
      await item.save();
      res.redirect("/");
    }
    else{
      const mani = await List.findOne({name:listName});
      mani.items.push(item);
      await mani.save();
      res.redirect("/"+listName);
    }
    
  }
  name();
 
});

app.post("/delete",async function (req,res) {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  if(listName==="Today"){
    console.log(checkedItemId);
    await Item.findOneAndDelete({_id:checkedItemId});
    res.redirect("/");
  }
  else{
   const pora = await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
   res.redirect("/"+listName);

  }  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
