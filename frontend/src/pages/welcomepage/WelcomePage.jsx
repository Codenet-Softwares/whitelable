import React from "react";
import "./welcomePage.css";
import { useAppContext } from "../../contextApi/context";

const WelcomePage = () => {
  const { store } = useAppContext();

  return (
    <div>
      <div className="WelcomePage">
        <header className="App-header">        
          <h1 className="animated-header2 fw-bold">
            Welcome To WhiteLabel Application
          </h1>
        </header>
        {/* <p className="text-dark">
            Manage your transactions efficiently and effectively.
          </p> */}
        <div>
          <div class="container">
            <h2 className="fw-bold text-white">
              Manage Your Transactions Efficiently And Effectively.
            </h2>          
          </div>
        </div>
          <h5 className="text-white fw-bold">We're Glad To Have You Back. Here’s What You Can Do Today:</h5>
        <section className="welcome-message ">
          <h2 className="welcome_msg text-white fw-bold">Welcome,<span className=""> [{store.admin.adminName}!]</span></h2>
        </section>
        <section className="features ">
          <h2 className="text-uppercase mt-5 fw-bold" style={{color:"#1E2761", textDecoration:"underline"}}>Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <i className="icon fa fa-chart-line"></i>
              <p className="fw-bold card_heading">Transaction Tracking</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-users"></i>
              <p className="fw-bold card_heading">Customer Management</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-chart-pie"></i>
              <p className="fw-bold card_heading">Detailed Analytics</p>
            </div>
            <div className="feature-item">
              <i className="icon fa fa-lock"></i>
              <p className="fw-bold card_heading">Secure and Reliable</p>
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



