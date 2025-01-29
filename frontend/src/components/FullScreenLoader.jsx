import React from 'react';

const FullScreenLoader = (props) => {
  return (
    props.show
      ? <React.Fragment>
                <div className="vw-100 vh-100 position-fixed top-0 start-0" style={{ backdropFilter: 'blur(6px)', zIndex: '9999' }}>
                    <div className="position-absolute top-50 start-50 translate-middle">
                        <i className="fa fa-spin fa-circle-notch"></i> Loading...
                    </div>
                </div>
            </React.Fragment>
      : null
  );
};

export default FullScreenLoader;
