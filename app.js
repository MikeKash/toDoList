//to use express for node
import express from "express";
//body parser need to be able to convert user provided info into values that we can use.
import bodyParser from "body-parser";
// enable database
import mongoose from "mongoose";
import _ from "lodash";

mongoose.connect('mongodb+srv://admin-michael:Michael123@cluster0.otpw8.gcp.mongodb.net/toDoListDB?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

// to use functions from the other JS pages
const localPort = 3000;
const herokuPort = process.env.PORT;

//to use express so app will be able to work
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

//so server wil know what files need to be treaded as static.
//such as css styles or images. Otherwise it won't work.
app.use(express.static("public"));

//this needs for ejs to work properly and render pages as intended
app.set('view engine', 'ejs');

// to ignore favicon, so it won't create new to do list with it's name
function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).json({nope: true});
    } else {
      next();
    }
  }
  app.use(ignoreFavicon);


// create schema, how info wil be stored in the databse.
const itemsSchema = {
    name: String
  };

// This will create a collection in the database
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({name: "Welcome to your to do List!"});
const item2 = new Item ({name: "Hit the + button to create an item."});
const item3 = new Item ({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

const listSchema = {
    listName: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", (reg, res) => {    
    Item.find({}, (err, foundItems) => {        
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err, docs) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Item successfully added");
                };
            });
            res.redirect("/");
        } else {
            List.find({}, (err, foundListItems) => {
            res.render('list', {listItemTitle: foundListItems, listTitle: "Today", newList: foundItems});
            });
            
            
        };         
    }); 
});

// this set of code to tell server what to do when user enters info into the form
app.post("/", (req, res) => {    
    // to catch what user typed in into the form
    const itemName = req.body.newToDo;
    const listName = req.body.list;      

    let item = new Item ({name: itemName});

    if (listName === "Today") {
        item.save();
        res.redirect("/");        
    } else {
        List.findOne({listName: listName}, (err, foundList) => {
            foundList.items.push(item)
            foundList.save();
            res.redirect("/" + listName);
        })
    }   
})

app.post("/newList", (req,res) => {
    const newToDoList = _.capitalize(req.body.newToDoList);
  
    List.findOne({listName: newToDoList}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List ({listName: newToDoList, items: defaultItems});
                list.save();
                res.redirect("/" + newToDoList);
            } else {
                // to find toDo list Names
             List.find({}, (err, foundListItems) => {
             res.render('list', {listItemTitle: foundListItems, listTitle: foundList.listName, newList: foundList.items});
           });
          }
        }
    });  

})


app.post("/delete", (req, res) => {
    // to target a checkbox button so item can be deleted
    const itemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.deleteOne({ _id : itemId }, (err, docs) => {
            if(err) {
                console.log(err);
            } else {
            console.log("Successful deletion");
            }
            res.redirect("/");
          }); 
    } else {
        List.findOneAndUpdate({listName: listName}, {$pull: {items: {_id: itemId}}}, (err, foundList) => {
            if(!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/deleteList", (req, res)=> {
    const listID = req.body.listID;

    List.deleteOne({_id: listID}, (err) => {
        if (!err) {
            res.redirect("/");
        }
    });

    // List.findOne({_id: listID}, (err, foundList) => {
    //     if (!err) {
    //         console.log(foundList);
    //     }
    // });
})


// To delete List names
app.post("/delete", (req, res) => {
    
});

app.get("/:list", (req, res) => {            
    let newList = req.params.list;
    newList = _.capitalize(newList);
    List.findOne({listName: newList}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List ({listName: newList, items: defaultItems});
                list.save();
                res.redirect("/" + newList);
            } else {
                // to find toDo list Names
List.find({}, (err, foundListItems) => {
    res.render('list', {listItemTitle: foundListItems, listTitle: foundList.listName, newList: foundList.items});
           });
          }
        }
    });
});   



app.get("/about", (reg, res) => {    
    res.render('about');
});

app.listen(herokuPort || localPort, () => {
    console.log("Server is running");
})



