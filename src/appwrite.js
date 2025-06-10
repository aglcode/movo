import { Query, Databases, Client, ID} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;   
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Validate environment variables
if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    console.error('Missing Appwrite environment variables:', {
        PROJECT_ID: !!PROJECT_ID,
        DATABASE_ID: !!DATABASE_ID,
        COLLECTION_ID: !!COLLECTION_ID
    });
}

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
const database = new Databases(client);

export const updateSearchCount = async (searchItem, movie) => {
    if (!DATABASE_ID || !COLLECTION_ID) {
        console.error('Cannot update search count: Missing database or collection ID');
        return;
    }

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchItem', searchItem)
        ])
        
        if(result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchItem,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.error('Error in updateSearchCount:', error);
    }
}


// FETCH THE TOP MOVIES FROM THE DATABASE BASED ON SEARCH COUNT
export const getTrendingMovies = async () => {
    if (!DATABASE_ID || !COLLECTION_ID) {
        console.error('Cannot get trending movies: Missing database or collection ID');
        return [];
    }

    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ])

        return result.documents;
    } catch (error) {
        console.error('Error in getTrendingMovies:', error);
        return [];
    }
}