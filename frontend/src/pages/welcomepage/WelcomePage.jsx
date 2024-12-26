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
              Manage your transactions efficiently and effectively.
            </div>
            <div class="p p2">
              {" "}
              Manage your transactions efficiently and effectively.
            </div>
            <div class="p p3">
              Manage your transactions efficiently and effectively.
              <div class="cursor"></div>
            </div>
          </div>
        </div>
        <section className="welcome-message mt-5">
          <h5 className="text-white mb-5">We're glad to have you back. Here’s what you can do today:</h5>
          <h2 className="mb-5 welcome_msg">Welcome,<span> [{store.admin.adminName}!]</span></h2>
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



