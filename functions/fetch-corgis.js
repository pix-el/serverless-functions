const fetch = require('node-fetch');
const { hasuraRequest } = require('./utils/hasura');

exports.handler = async () => {
    const corgis = await fetch('http://no-cors-api.netlify.app/api/corgis')
        .then(res => res.json());

    const unsplashPromise = fetch('https://api.unsplash.com/collections/48405776/photos', {
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
    }).then(res => res.json());

    const hasuraPromise = hasuraRequest({
        query: `mutation InsertOrUpdateBoops($corgis: [boops_insert_input!]!) {
            boops: insert_boops(objects: $corgis, on_conflict: {constraint: boops_pkey, update_columns: id}) {
              returning {
                count
                id
              }
            }
          }
          `,
          variables: {
              corgis: corgis.map(corgi => ({ id: corgi.id, count: 0}))
          }
    });

    const [unsplashPhotos, hasuraData] = await Promise.all([unsplashPromise, hasuraPromise]);

    const corgiData = corgis.map(corgi => {
        const photo = unsplashPhotos.find(p => corgi.id === p.id);
        const boops = hasuraData.boops.returning.find(c => corgi.id === c.id);
        return {
            ...corgi,
            alt: photo.alt_description,
            credit: photo.user.name,
            url: `${photo.urls.raw}&auto=format&fit=crop&w=300&h=300&q=80&crop=entropy`,
            boops: boops.count
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