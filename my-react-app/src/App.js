import React from 'react';
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import * as reactRouterDom from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './Homepage/homepage';
import ProjectPage from './ProjectPage/projectpage';
import PhotoDetails from './PhotoDetails/photodetails';
import VideoDetails from './VideoDetails/videodetails';
import SearchPage from './SearchPage/searchpage';
import styles from './App.module.css'; 


//From https://supertokens.com/docs/emailpassword/pre-built-ui/setup/frontend
SuperTokens.init({
  appInfo: {
      appName: "dam.io",
      apiDomain: "https://dambackend.onrender.com",
      websiteDomain: "https://damfront6.onrender.com",
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
  },
  getRedirectionURL: async (context) => {
    if (context.action === "SUCCESS" && context.newSessionCreated) {
        if (context.redirectToPath !== undefined) {
            // we are navigating back to where the user was before they authenticated
            return context.redirectToPath;
        }
        if (context.createdNewUser) {
            return "/homepage"
        } else {
            return "/homepage"
        }
    }
    return "/homepage";
  },
  recipeList: [
      EmailPassword.init(),
      Session.init()
  ]
});

function App() {
  return (
    <SuperTokensWrapper>
      <Router>
        <Routes>
          {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI])}
          <Route 
            path="/"
            element={
              <div className={styles.App}>
                <header className={styles['App-header']}>
                  <div className={styles['title-container']}>
                    <div className={styles.circle}></div>
                    <Link to="/auth" className={styles.title}>DAM.IO</Link>
                  </div>
                </header>
              </div>
            }
          />
          <Route 
            path="/homepage" 
            element={
              <SessionAuth>
                <HomePage />
              </SessionAuth>
            } 
          />
          <Route 
            path="/:projectname" 
            element={
              <SessionAuth>
                <ProjectPage />
              </SessionAuth>
            } 
          />
          <Route 
            path="/:projectname/photo/:name" 
            element={
              <SessionAuth>
                <PhotoDetails />
              </SessionAuth>
            } 
          />
          <Route 
            path="/:projectname/video/:name" 
            element={
              <SessionAuth>
                <VideoDetails />
              </SessionAuth>
            } 
          />
          <Route 
            path="/search/:type/:query" 
            element={
              <SessionAuth>
                <SearchPage />
              </SessionAuth>
            } 
          />
        </Routes>
      </Router>
    </SuperTokensWrapper>
  );
}

export default App;
