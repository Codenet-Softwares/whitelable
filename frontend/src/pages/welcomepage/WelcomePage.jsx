import React from "react";
import "./welcomePage.css";
import { useAppContext } from "../../contextApi/context";

const WelcomePage = () => {
  const { store } = useAppContext();

  console.log(store);
  return (
    <div>
      <div className="WelcomePage">
        <header className="App-header">
          <h1 className="animated-header">Welcome to WhiteLabel Application</h1>
          <p className="text-dark">
            Manage your transactions efficiently and effectively.
          </p>
        </header>
        <section className="welcome-message">
          <h2>Welcome, {store.admin.adminName}!</h2>
          <p>We're glad to have you back. Here’s what you can do today:</p>
        </section>
        <section className="features">
          <h2>Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <i className="icon fa fa-chart-line"></i>
              <p>Transaction Tracking</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-users"></i>
              <p>Customer Management</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-chart-pie"></i>
              <p>Detailed Analytics</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-lock"></i>
              <p>Secure and Reliable</p>
            </div>
          </div>
        </section>
        <section className="cta">
          <button>Get Started</button>
        </section>
      </div>
    </div>
  );
};

export default WelcomePage;
