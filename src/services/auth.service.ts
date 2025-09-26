export default class AuthService {
    static async createUser() {
        try {
            return { 
                message: "Hello world"
            }
        } catch(err) {
            if(err instanceof Error) {
                throw new Error("Some error occurred");
            }
        }
    }
}