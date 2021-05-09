const { hasuraRequest } = require("./utils/hasura");

exports.handler = async (event) => {
    console.log(event.body);
    const { id } = JSON.parse(event.body);

    const data = await hasuraRequest({
        query: `
        mutation UpdateBoopCount($id: String!) {
            updated: update_boops_by_pk(pk_columns: {id: $id}, _inc: {count: 1}) {
              count
              id
            }
          }
        `,
        variables: {
            id,
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    }
}