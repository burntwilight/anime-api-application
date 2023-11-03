import express from "express"
import axios from "axios"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { inject } from '@vercel/analytics'



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var pageCheck = "Home";

const app = express()
const APIBASEURL = "https://kitsu.io/api/edge/anime/"
const AUTHBASEURL = "https://kitsu.io/api/oauth/"
const CATEGORYFILTERURL = "?filter%5Bcategories%5D="
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

app.use(express.static(__dirname + '/public'))


app.get(["/", "/random"], async (req, res) => {
    try {
        inject()
        pageCheck = "Home";
        let random_choice = Math.floor(Math.random() * 11000);
        const response = await axios.get(APIBASEURL+(random_choice));

        const result = response.data;
        
        let animeName = result.data.attributes.titles.en;
        const animeImage = result.data.attributes.posterImage.large;
        let animeDescription = result.data.attributes.description;
        let animeLink = `https://kitsu.io/anime/${result.data.attributes.slug}`;

        if (typeof animeDescription === "undefined"){
            animeDescription = "No description available."
        };

        if (typeof animeName === "undefined"){
            animeName = result.data.attributes.canonicalTitle;
        };

        res.render(__dirname + "/views/index.ejs", {animeName: animeName, animeDescription: animeDescription, animeImage: animeImage, animeLink: animeLink, pageCheck: pageCheck})
    } catch (error) {
        res.render(__dirname + "/views/index.ejs", {content: error});
    };
});

app.post("/submit", async (req, res) => {
    try {

        let resultArray = [];

        let categoryFullList = [
            'comedy',
            'fantasy',
            'romance',
            'action',
            'drama',
            'school life',
            'adventure',
            'slice of life',
            'yaoi',
            'science fiction',
            'shoujo ai',
            'ecchi',
            'sports',
            'historical',
            'magic',
            'music',
            'mystery',
            'harem',
            'japan',
            'supernatural',
            'psychological',
            'thriller',
            'earth',
            'horror',
            'kids',
            'shounen',
            'present',
            'shounen ai',
            'asia',
            'seinen',
            'martial arts',
            'mecha',
            'demon',
            'isekai',
            'super power',
            'shoujo',
            'fantasy world',
            'violence',
            'military',
            'parody'
        ];
        
        const selectedCategory = req.body.category;

        if (categoryFullList.includes(selectedCategory)) {

            pageCheck = "Home"

            const response = await axios.get(`${APIBASEURL}${CATEGORYFILTERURL}${selectedCategory}`);
            const result = response.data;
            const resultFromCategory = result.data;

            for (let i = 0; i < resultFromCategory.length; i++){
            resultArray.push(resultFromCategory[i].id);
            };
            let random_choice = resultArray[Math.floor(Math.random() * resultArray.length)];

            const animeName = resultFromCategory.find(item => item.id === random_choice).attributes.titles.en;
            const animeImage = resultFromCategory.find(item => item.id === random_choice).attributes.posterImage.large;
            const animeDescription = resultFromCategory.find(item => item.id === random_choice).attributes.description;
            let animeLink = `https://kitsu.io/anime/${resultFromCategory.find(item => item.id === random_choice).attributes.slug}`;

            res.render(__dirname + "/views/index.ejs", {animeName: animeName, animeDescription: animeDescription, animeImage: animeImage, animeLink: animeLink, pageCheck: pageCheck})
        } else {
            pageCheck = "Categories"
            res.render(__dirname + "/views/index.ejs", {animeName: "Please retry your request with one of the following valid genre name:", categoryFullList: categoryFullList, pageCheck: pageCheck})
        };
    } catch (error) {
        res.render(__dirname + "/views/index.ejs", {animeDescription: error, pageCheck: pageCheck});
    };
});

app.get("/login", async (req, res) => {
    try {
        pageCheck = "Login";

        res.render(__dirname + "/views/index.ejs", {pageCheck: pageCheck})
    } catch (error) {
        console.log(`Error: Status ${error.response.status}, Message: ${error.response.data.error_description}`);
        res.render(__dirname + "/views/index.ejs", {content: error});
    };
});

app.post("/login", async (req, res) => {
    try {

        const requestBody = req.body;

        const userLoginInformation = {
            grant_type: 'password',
            username: req.body.email,
            password: encodeURIComponent(req.body.password) // RFC3986 URl encoded string
        };

        const response = await axios.post(`${AUTHBASEURL}token`, userLoginInformation)

        pageCheck = "Home"

        // res.render(__dirname + "/views/index.ejs", {pageCheck: pageCheck})

        res.redirect("/")

    } catch (error) {
        console.log(error.response.data)
        res.render(__dirname + "/views/index.ejs", {content: error});
    };
});

app.get("/about", (req, res) => {

    pageCheck = "About"
    
    try {
        res.render(__dirname + "/views/index.ejs", {pageCheck: pageCheck})
    } catch (error) {
        res.render(__dirname + "/views/index.ejs", {content: error})
    }

})

app.listen(port, (req, res) => {
    console.log(`Server started on ${port}`);
});

