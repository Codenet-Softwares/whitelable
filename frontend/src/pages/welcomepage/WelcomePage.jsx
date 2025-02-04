import React from "react";
import "./welcomePage.css";
import { useAppContext } from "../../contextApi/context";

const WelcomePage = () => {
  const { store } = useAppContext();

  return (
    <div>
      <div className="WelcomePage">
        <header className="App-header">
          <h1 className="animated-header1">
            Welcome To WhiteLabel Application
          </h1>
          <h1 className="animated-header2">
            Welcome To WhiteLabel Application
          </h1>
        </header>
        {/* <p className="text-dark">
            Manage your transactions efficiently and effectively.
          </p> */}
        <div id="BrushCursor">
          <div class="container">
            <div class="p p1">
              {" "}
              Manage Your Transactions Efficiently And Effectively.
            </div>
            <div class="p p2">
              {" "}
              Manage Your Transactions Efficiently And Effectively.
            </div>
            <div class="p p3">
              Manage Your Transactions Efficiently And Effectively.
              <div class="cursor"></div>
            </div>
          </div>
        </div>
        <section className="welcome-message mt-5">
          <h5 className="text-white mb-5">We're Glad To Have You Back. Here’s What You Can Do Today:</h5>
          <h2 className="mb-5 welcome_msg">Welcome,<span className="mt-1"> [{store.admin.adminName}!]</span></h2>
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



