const fetch = require('node-fetch');

exports.handler = async () => {
    const corgis = await fetch('http://no-cors-api.netlify.app/api/corgis')
        .then(res => res.json());

    const unsplashPhotos = await fetch('https://api.unsplash.com/collections/48405776/photos', {
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
    }).then(res => res.json());

    const corgiData = corgis.map(corgi => {
        const photo = unsplashPhotos.find(p => corgi.id === p.id);
        return {
            ...corgi,
            alt: photo.alt_description,
            credit: photo.user.name,
            url: `${photo.urls.raw}&auto=format&fit=crop&w=300&h=300&q=80&crop=entropy`
        }
    })

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(corgiData)
    }
};