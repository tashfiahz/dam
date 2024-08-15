import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import dotenv from 'dotenv'

dotenv.config();

export const SuperTokensConfig = {
    framework: "express",
    supertokens: {
        connectionURI: process.env.LOGIN_CONNECTION_URI,
        apiKey: process.env.LOGIN_API_KEY,
    },
    appInfo: {
        appName: "dam.io",
        apiDomain: "https://dambackend.onrender.com",
        websiteDomain: "https://damfront6.onrender.com",
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    recipeList: [
        EmailPassword.init(),
        Session.init()
    ]
};