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
import styles from './App.module.css'; 

SuperTokens.init({
  appInfo: {
      appName: "dam.io",
      apiDomain: "http://localhost:3501",
      websiteDomain: "http://localhost:3000",
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
    return undefined;
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
        </Routes>
      </Router>
    </SuperTokensWrapper>
  );
}

export default App;
