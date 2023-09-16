import express from "express"
import axios from "axios"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express()
const APIBASEURL = "https://kitsu.io/api/edge/anime/"
const CATEGORYFILTERURL = "?filter%5Bcategories%5D="
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

app.get(["/", "/random"], async (req, res) => {
    try {
        let random_choice = Math.floor(Math.random() * 11000);
        const response = await axios.get(APIBASEURL+(random_choice));

        const result = response.data;
        
        let animeName = result.data.attributes.titles.en;
        const animeImage = result.data.attributes.posterImage.large;
        const animeDescription = result.data.attributes.description;
        let animeLink = `https://kitsu.io/anime/${result.data.attributes.slug}`;

        if (typeof animeName === "undefined"){
            animeName = result.data.attributes.slug;
        };

        res.render(__dirname + "/views/index.ejs", {animeName: animeName, animeDescription: animeDescription, animeImage: animeImage, animeLink: animeLink})
    } catch (error) {
        res.render(__dirname + "/views/index.ejs", {content: error});
    };
});

app.post("/submit", async (req, res) => {
    try {
        let resultArray = [];
        const categoryFullList = [
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

            res.render(__dirname + "/views/index.ejs", {animeName: animeName, animeDescription: animeDescription, animeImage: animeImage, animeLink: animeLink})
        } else {
            res.render(__dirname + "/views/index.ejs", {animeName: "Please retry your request with one of the following valid genre name:", categoryFullList: categoryFullList})
        }; 
    } catch (error) {
        res.render(__dirname + "/views/index.ejs", {animeDescription: error});
    };
});


app.listen(port, (req, res) => {
    console.log(`Server started on ${port}`);
});