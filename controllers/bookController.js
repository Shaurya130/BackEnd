const Book = require('../models/books');

// whenever we are interacting with mongodb we recieve a promise in order to  handle that we use express-async-handler
const asyncHandler= require("express-async-handler")

//now we dont need to write try catch block async handler would automatically send the error to the handler so wrap our request in asynchandler

//@desc Get all Books
//@route GET /books
//access- public

const bookIndex = asyncHandler(async(req, res) => {
    const Boook=await Book.find({ user_id:req.user.id})
    res.status(200).render('index', { books: Boook });
});

//@desc Fetch a certain book
//@route GET /books/:id
//@access public

const bookDetails = asyncHandler(async(req, res) => {
    const bookId = req.params.id; 
    const boom= await Book.findById(bookId);
    if(!boom){
        res.status(404).render('err');
        throw new Error("Contact not found");
    }
    res.status(200).json(boom);
});

//@desc Delete a particular book
//@route POST /books/:id/delete
//@access private

const bookDelete = asyncHandler(async(req, res) => {
    const bookId = req.params.id;
    const bookDt= await Book.findById(bookId);
    if(!bookDt){
        res.status(404).render('err');
        throw new Error("Book not found")
    }

    if(bookDt.user_id.toString() !== req.user.id ){ //|| process.env.ADMIN_EMAIL== req.user.id){
        res.status(403);
        throw new Error("User Dont have permission to delete other users books")
    }
    const bookDelete= await Book.findByIdAndDelete(bookId);
    res.status(201).json({"message":"Deleted book with id ${req.params.id}"})
});

//@desc Editng a BOOK
//@route POST /books/:id/edit
//@access private

const bookEdit = asyncHandler(async(req, res) => {
    const bookId = req.params.id;
    const bookCheck= await Book.findById(bookId);
    if(!bookCheck){
        res.status(404).render('err');
        throw new Error("Book not found")
    } 

    if(bookCheck.user_id.toString() !== req.user.id){
        res.status(403);
        throw new Error("User Dont have permission to update other users books")
    }
    const updatedBook = {
        BookName: req.body.BookName,
        Author: req.body.Author,
        Year: req.body.Year,
        Price: req.body.Price,
        Discount: req.body.Discount,
        NumberOfPages: req.body.NumberOfPages,
        Description: req.body.Description,
        Fresh: req.body.Fresh === 'on'  
    };
    const bookEdit= await Book.findByIdAndUpdate(bookId, updatedBook, { new: true });
    res.status(200).json(updatedBook);
});

//@desc Creating a book
//@route POST /books/create
//@access private

const bookCreate = asyncHandler(async(req, res) => {
    console.log("The requested body is:",req.body);
    const{ BookName,Author,Year,Price,Discount,NumberOfPages,Fresh,Description }= req.body;
    if(!BookName || !Author || !Year || !Price || !Discount  || !NumberOfPages || !Fresh || !Description){
        res.status(400)
        throw new Error("All fields are mandatory")
    }
    const newBook = new Book({
        BookName: req.body.BookName,
        Author: req.body.Author,
        Year: req.body.Year,
        Price: req.body.Price,
        Discount: req.body.Discount,
        NumberOfPages: req.body.NumberOfPages,
        Description: req.body.Description,
        Fresh: req.body.Fresh === 'on'  
    });
    await newBook.save()
    const bookc= await Book.create({
      BookName,
      Author,
      Year,
      Price,
      Discount,
      NumberOfPages,
      Description,
      Fresh,
      user_id: req.user.id  
    })
    res.status(201).json({newBook})
});

module.exports = {
    bookIndex,
    bookDetails,
    bookCreate,
    bookEdit,
    bookDelete
};