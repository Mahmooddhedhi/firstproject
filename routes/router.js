const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema")
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate")

router.get("/getproducts", async (req, res) => {
    try {
        const productsdata = await Products.find();
        // console.log("console the data" + productsdata)
        res.status(201).json(productsdata);

    } catch (error) {
        console.log("error" + error.message);

    }
});

router.get("/getproductsone/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);

        const individualdata = await Products.findOne({ id: id });
        // console.log(individualdata + "individual data")
        res.status(201).json(individualdata)
    } catch (error) {
        res.status(400).json(individualdata)
        console.log("error" + error.message);

    }
});

router.post("/register", async (req, res) => {
    // console.log(req.body);

    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "fill all the  details" });
        console.log("no data available");

    };

    try {

        const preuser = await USER.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email  already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new USER({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge

            const storedata = await finaluser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        // console.log("error the bhai catch ma for registratoin time" + error.message);
        // res.status(422).send(error);
    }


})

router.post("/login", async(req,res)=>{
    const{email,password}= req.body;

    if(!email || !password){
        res.status(400).json({error:"fill all the details"})
    };

    try {
        const userlogin = await USER.findOne({email:email});
        if(userlogin){
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch + "pass match");

            const token = await userlogin.generateAuthtoken();
            // console.log(token)

            res.cookie("Amazonweb", token,{
                expires:new Date(Date.now() + 6000000),
                httpOnly:true
            })

            if (!isMatch) {
                res.status(400).json({error:"invalid details"})
                
            }else{
                res.status(201).json(userlogin);
            }
        }else{
            res.status(400).json({error:"invalid details"}) 
        }
        
    } catch (error) {
        res.status(400).json({error:"invalid details"})
        
    }
})

router.post("/addtocart/:id",authenticate, async(req,res)=>{
    try {
        const {id} = req.params;
        const cart = await Products.findOne({id:id});
        console.log(cart + "cart value")

        const UserContact = await USER.findOne({_id:req.userID});
        console.log(UserContact)
        
        if (UserContact) {
            const cartdata = await UserContact.addcartdata(cart);
            await UserContact.save();
            console.log(cartdata);
            res.status(201).json(UserContact)
            
        }else{
            res.status(401).json({error: "invailid user"})
        }
    } catch (error) {
        res.status(401).json({error: "invailid user"})
    }

})



module.exports = router;