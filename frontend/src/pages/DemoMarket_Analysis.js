import React from "react";
import "./DemoMarket_Analysis.css";
import Picture from "../Assets/Picture.webp";

export const DemoMarket_Analysis = () => {
  return (
    <div class="container-fluid mt-5">
      <div class="card-group">
        <div
          className="card bg-white border-0 rounded-top"
          style={{ width: "18rem" }}
        >
          <div
            className="card-header d-flex justify-content-between"
            style={{ padding: "0", border: "1px solid #E5E4E2	" }}
          >
            <div
              className="d-flex"
              style={{
                borderTopRightRadius: "28px",
                padding: "10px",
                background: "#1D5E6C",
              }}
            >
              <h4 className="m-0 text-white px-3 p-2">Featured</h4>
              <i
                class="fa fa-info-circle text-white px-4 mt-3 info_icon"
                aria-hidden="true"
              ></i>
            </div>
            <div>
              <div className="mt-2 px-4">
                <h4 className="mt-3 fw-bolder">Matched $ 53.70M</h4>
              </div>
            </div>
          </div>
          <table className="table table-bordered table-striped border">
            <thead>
              <tr>
                <th className="team-name-column"></th>
                <th
                  className="back-column text-center"
                  style={{ background: "#54A9EE", fontSize: "20px" }}
                >
                  Back
                </th>
                <th
                  className="lay-column text-center "
                  style={{ background: "#E5798B", fontSize: "20px" }}
                >
                  Lay
                </th>
                <th className="min-max-column text-center">
                  <h6 className="min-max-value mt-2 px-5 p-1">
                    <span className="fw-bold text-primary ">Min/Max</span>
                    100-2500
                  </h6>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Australia Row */}
              <tr className="">
                <td className="team-name px-3">
                  <h4 className="fw-bolder ">Australia</h4>
                  <span className="number">
                    <i
                      class="fa fa-arrow-right fw-bold green_icon"
                      aria-hidden="true"
                    ></i>
                    <span className="px-2 fw-bold green_icon">55</span>
                  </span>
                </td>
                <td className="back-cell text-center fw-bold">
                  <h6 className="fw-bold ">80</h6>
                  <span>555.66</span>
                </td>
                <td className="lay-cell text-center fw-bold">
                  <h6 className="fw-bold">950</h6>
                  <span>7.77</span>
                </td>
              </tr>
              {/* India Row */}
              <tr>
                <td className="team-name px-3">
                  <h4 className="fw-bolder ">India</h4>
                  <span className="number">
                    <i
                      class="fa fa-arrow-right fw-bold red_icon"
                      aria-hidden="true"
                    ></i>
                    <span className="px-2 fw-bold red_icon">55</span>
                  </span>
                </td>
                <td className="back-cell text-center fw-bold ">
                  <h6>80</h6>
                  <span>555.66</span>
                </td>
                <td className="lay-cell text-center fw-bold">
                  <h6 className="fw-bold ">1.01</h6>
                  <span>94.66</span>
                </td>{" "}
              </tr>
              {/* The Draw Row */}
              <tr>
                <td className="team-name px-3">
                  <h4 className="fw-bolder">The Draw</h4>
                  <span className="number">
                    <i
                      class="fa fa-arrow-right fw-bold green_icon"
                      aria-hidden="true"
                    ></i>
                    <span className="px-2 fw-bold green_icon">55</span>
                  </span>
                </td>
                <td className="back-cell text-center fw-bold ">
                  <h6>80</h6>
                  <span>555.66</span>
                </td>
                <td className="lay-cell text-center fw-bold">
                  <h6 className="fw-bold ">1000</h6>
                  <span>9.66</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2nd Part  */}
        <div class="card">
          <div class="rounded-top" style={{ background: "#1D5E6C" }}>
            <h4 class="card-header text-white fw-bold ">Live Streaming</h4>
          </div>
          <div class="card mt-3">
            <h4
              class="card-header text-white fw-bold rounded-top"
              style={{ background: "#1D5E6C" }}
            >
              Score Card
            </h4>
            <div className="card-body p-0">
              <img
                src={Picture}
                alt="Market-analysis"
                style={{ width: "100%", height: "235px" }}
              />
            </div>
          </div>
          <div className="card mt-3">
            <div className="rounded-top" style={{ background: "#1D5E6C" }}>
              <h4 className="card-header text-white fw-bold">Book</h4>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <button
                className="btn me-3 text-white fw-bolder px-5"
                style={{ background: "#1D5E6C" }}
              >
                Master Book
              </button>
              <button
                className="btn text-white fw-bolder px-5"
                style={{ background: "#1D5E6C" }}
              >
                User Book
              </button>
            </div>
          </div>
          <div className="card mt-4">
            <div
              className="d-flex align-items-center rounded-top"
              style={{ background: "#1D5E6C" }}
            >
              {/* Live Bet Section */}
              <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3">
                Live Bet
              </h4>
              <div className="form-check form-switch mt-1 me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="liveBetToggle1"
                  style={{ transform: "scale(1.5)" }}
                />
              </div>

              {/* Partnership Book Section */}
              <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3">
                Partnership Book
              </h4>
              <div className="form-check form-switch mt-1 me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="liveBetToggle2"
                  style={{ transform: "scale(1.5)" }}
                />
              </div>
              {/* View More Section */}
              <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent ms-auto">
                View More
              </h4>
            </div>

            <div className="card-body text-center">
              <h5
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "gray",
                }}
              >
                There are no any bet.
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
