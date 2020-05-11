const express = require("express");
const mongodb = require("mongodb");
var bodyParser = require("body-parser");
const multer = require("multer");
// const ThermalPrinter = require("node-thermal-printer").printer;
// const PrinterTypes = require("node-thermal-printer").types;
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  }, 
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

async function example() {
  // let printer = new ThermalPrinter({
  //     type: PrinterTypes.EPSON,              // 'star' or 'epson'
  //     interface: '/dev/usb/lp0',
  //     options: {
  //         timeout: 1000
  //     },
  //     width: 48,                      // Number of characters in one line (default 48)
  //     characterSet: "SLOVENIA",       // Character set default SLOVENIA
  //     removeSpecialCharacters: false, // Removes special characters - default: false
  //     lineCharacter: "-",             // Use custom character for drawing lines
  // });
  // let isConnected = await printer.isPrinterConnected();
  // console.log("Printer connected:", isConnected);
  // printer.print("Hello World"); 
  // printer.cut();
  // printer.execute();
}
const upload = multer({ 
  storage: storage, 
  // fileFilter: filefilter
 });
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.use(bodyParser.urlencoded());

const router = express.Router();

// Get Posts
router.get("/", async (req, res) => {
  const posts = await loadPostsCollection();
  res.send(await posts.find({"number": null}).toArray());
});
router.get("/gethistory/:start&&:end", async (req, res) => {
  example();
  console.log(new Date(req.params.start))
  console.log(new Date(req.params.end))
  // console.log(starttime);
  // console.log(endtime);
  const posts = await loadPostsCollection();
  res.send(await posts.find({number: { $ne: null },createdAt:
  {
    $gte:new Date(req.params.end),
  }
  // {
  //   "$gte": new Date(req.params.start),
  //   "$lt": new Date(req.params.end),
  // }
})
.sort({datefield: -1})
.toArray());
});

// Add Post
router.post("/history", async (req, res) => {
  const posts = await loadPostsCollection();
  await posts.insertOne({
    name: req.body.name,
    price: req.body.price,
    type: req.body.type,
    imagename: req.body.imagename,
    number:req.body.number,
    createdAt: req.body.createdAt,
  });
  res.status(201).send();
});
router.post("/add", async (req, res) => {
  const posts = await loadPostsCollection();
  await posts.insertOne({
    name: req.body.name,
    price: req.body.price,
    type: req.body.type,
    imagename: req.body.imagename,
    createdAt: req.body.createdAt,
  });
  res.status(201).send();
});
router.post("/update", async (req, res) => {
  const posts = await loadPostsCollection();
  if(req.body.imagename == null){
    await posts.updateOne({"_id": mongodb.ObjectID(req.body.id)},{$set:{
      name: req.body.name,
      price: req.body.price,
      type: req.body.type,
      createdAt: req.body.createdAt,
    }});
  }else{
    await posts.updateOne({"_id": mongodb.ObjectID(req.body.id)},{$set:{
      name: req.body.name,
      price: req.body.price,
      type: req.body.type,
      imagename: req.body.imagename,
      createdAt: req.body.createdAt,
    }});
  }
  res.status(201).send();
});
router.post("/addimage", upload.single("productImage"), async (req, res) => {
  res.status(201).send();
});
router.post("/addimagehistory", async (req, res) => {
  var src = "C:/Users/joonb/OneDrive/Desktop/web/uploads/"+req.body.imagename;
  var dest = "C:/Users/joonb/OneDrive/Desktop/web/history/"+req.body.imagename;
  fs.copyFile(src, dest, (err) => {
    if (err) throw err;
    // console.log('source.txt was copied to destination.txt');
  });
});

router.post("/deleteimage", async (req, res) => {
  var url = "C:/Users/joonb/OneDrive/Desktop/web/uploads/"+req.body.imagename;
  console.log(url);
  fs.unlink(url,function(err){
    console.log(err);
  });
});

// Delete Post
router.delete("/:id", async (req, res) => {
  const posts = await loadPostsCollection();
  await posts.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

async function loadPostsCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb://localhost:27017",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  return client.db("vue_express").collection("posts");
}

module.exports = router;
