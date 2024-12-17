import React from 'react';

const Footer = () => {
  return (
    <div>
      <div className="footer_part">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="footer_iner text-center">
                <p>
                  2023 © Influence - Designed by Codenet Softwares Pvt. Ltd.{' '}
                  <a href="#">
                    {' '}
                    <i className="ti-heart"></i>{' '}
                  </a>
                  <a href="#">Dashboard</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
