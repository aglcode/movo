import { Query, Databases, Client, ID} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;   
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;


// create a function to update the search count
// --- 2 variables needed (searchItem) and (movie)

// ----- 1. Use Appwrite API/SDK to check if the search term exist in the databse
// ----- 2. Update the count, if document is found
// ----- 3. Create a new document with the search term and count as 1, if document not found

// Get access to APPWRITE CLIENT
const client = new Client()
       .setEndpoint('https://fra.cloud.appwrite.io/v1')
       .setProject(PROJECT_ID)

// APPWRITE DATABASE
const databse = new Databases(client);

export const updateSearchCount = async (searchItem, movie) => {
    // ----- 1. Use Appwrite API/SDK to check if the search term exist in the databse
    try {
        const result = await databse.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchItem', searchItem)
        ])
    // ----- 2. Update the count, if document is found
        if(result.documents.length > 0) {
            const doc = result.documents[0];

            await databse.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else {
            // ----- 3. Create a new document with the search term and count as 1, if document not found
            await databse.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchItem,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.log(error)
    }
}


// FETCH THE TOP MOVIES FROM THE DATABASE BASED ON SEARCH COUNT
export const getTrendingMovies = async () => {
    try {
        const result = await databse.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ])

        return result.documents;
    } catch (error) {
        console.log(error);
    }
}