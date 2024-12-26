import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Prompt } from 'react-router';
import { Modal, Button } from 'react-bootstrap';
import { useAppContext } from '../contextApi/context';
import { getHierarchy } from '../Utils/service/apiService';
import Card from './common/Card';
import { getHierarchyState } from '../Utils/service/initiateState';
import Pagination from './common/Pagination';

const HierarchyPageView = () => {
  const { userName } = useParams();
  const { store } = useAppContext();
  const [hierarchyData, setHierarchyData] = useState([]);
  const [pathData, setPathData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [demoData, setDemoData] = useState(getHierarchyState);
  const [totalData, setTotalData] = useState(0);
  const [totalEntries, setTotalEntries] = useState(5);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalData: 0,
    totalEntries: 5,
  });

  // console.log('========>Hierechy',totalPages)
  const takeMeToAccount = (userName) => {
    navigate(`/account-landing/${userName}`);
  };

  const navigate = useNavigate();
  let action = 'store';
  let data = { page: paginationData.currentPage, searchName: name };

  async function ClearPath() {
    const action = 'clearAll';
    const data = {
      adminName: userName,
      action: action,
    };

    const response = await getHierarchy(data);
    if (response.successCode) {
      console.log(response);
      navigate(`/wallet`);
    }
  }

  const fetchData = async () => {
    const res = await getHierarchy({
      adminName: userName,
      action: action,
      totalEntries: paginationData.totalEntries,
      searchName: name,
      pageNumber: paginationData.currentPage,
    });
    if (res) {
      console.log('Response=>> HIERECHY', res.data);
      setHierarchyData(res.data.userDetails.createdUsers);
      setPathData(res.data.path);
      setIsLoading(false);
      setPaginationData({
        ...paginationData,
        currentPage: res.data.page,
        totalPages: res.data.totalPages,
        totalData: res.data.totalRecords,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [userName, action, paginationData.totalEntries, name, paginationData.currentPage]);

  let startIndex = Math.min((paginationData.currentPage - 1) * paginationData.totalEntries + 1);
  let endIndex = Math.min(paginationData.currentPage * paginationData.totalEntries, paginationData.totalData);

  // useEffect(() => {
  //   AccountServices.getHierarchy(userId, auth.user)
  //     .then((res) => {
  //       setHierarchyData(res.data.userDetails.createdUsers);
  //       setPathData(res.data.path);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, [userId, auth]);

  console.log('hierarchy data=>>>', hierarchyData);
  console.log('Path data=>>>', pathData);
  console.log('demoData', demoData);

  const handlePageChange = (page) => {
    console.log('Changing to page:', page);
    setPaginationData({
      ...paginationData,
      currentPage: page,
    });
    setIsLoading(false);
  };

  return (
    <div class="main_content_iner overly_inner ">
      <div class="container-fluid p-5 ">
        <div class="row">
          <div class="col-12">
                <h3 class="f_s_25 f_w_700 dark_text mr_30 text-center mt-5 text-uppercase fw-bolder" style={{textDecoration:"underLine", color:"#1E2761"}}>Hierarchy Dashboard</h3>
            <div class="page_title_box d-flex flex-wrap align-items-center justify-content-between">
              <div class="page_title_left d-flex align-items-center">
                <ol class="breadcrumb page_bradcam mb-0">
                  <li class="breadcrumb-item">
                    <a href="#" onClick={ClearPath}>
                      {store.admin.adminName}
                    </a>
                  </li>
                  <li class="active">
                    {' '}
                    {pathData.map((data) => (
                      <Link
                        to={{
                          pathname: `/hierarchyView/${data}`,
                        }}
                      >
                        <a style={{ cursor: 'pointer' }}>&nbsp;/&nbsp;{data}</a>
                      </Link>
                    ))}
                  </li>
                </ol>
              </div>
              <div class="page_title_right">
                <div class="page_date_button d-flex align-items-center">
                  <img src="img/icon/calender_icon.svg" alt="" />
                  {Date()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="white_card card_height_100 mb_30 pt-4">
              <div class="white_card_body">
                <div class="QA_section">
                  <div class="white_box_tittle list_header">
                    <h4 className='fw-bolder' style={{color:"#1E2761"}}>User List </h4>
                    <div class="box_right d-flex lms_block gap-5">
                      <select
                        class="form-select form-select-sm w-25"
                        aria-label=".form-select-sm example"
                        onChange={(e) =>
                          setPaginationData({
                            ...paginationData,
                            totalEntries: Number(e.target.value),
                          })
                        }
                      >
                        <option selected value="5">
                          Show 5 entries
                        </option>
                        <option value="10">10 entries</option>
                        <option value="15">15 entries</option>
                        <option value="25">25 entries</option>
                        <option value="50">50 entries</option>
                        <option value="75">75 entries</option>
                      </select>
                      <div class="serach_field_2">
                        <div class="search_inner">
                          <form Active="#">
                            <div class="search_field">
                              <input
                                value={name}
                                type="text"
                                placeholder="Search content here..."
                                onChange={(e) => {
                                  setName(e.target.value);
                                }}
                              />
                            </div>
                            <button type="submit">
                              {' '}
                              <i class="ti-search"></i>{' '}
                            </button>
                          </form>
                        </div>
                      </div>
                      <div class="add_button ms-2">
                        {/* <a
                          href="#"
                          data-toggle="modal"
                          data-target="#addcategory"
                          class="btn_1"
                        >
                          search
                        </a> */}
                      </div>
                    </div>
                  </div>

                  <div class="QA_table mb_30">
                    {isLoading ? (<div className='text-center'>Loading...</div>) : hierarchyData?.length > 0 ? (
                      <>
                        {' '}
                        <table class="table lms_table_active table-bordered table-striped">
                          <thead>
                            <tr className="text-bolder fs-6 text-center" style={{background:"#1E2761"}}>
                              <th scope="col" className='text-white'>Username</th>
                              <th scope="col" className='text-white'>Credit ref</th>
                              <th scope="col" className='text-white'>Partnership</th>
                              <th scope="col" className='text-white'>Balance</th>
                              <th scope="col" className='text-white'>Exposure</th>
                              <th scope="col" className='text-white'>Avail. Bal.</th>
                              <th scope="col" className='text-white'>Ref. P/L</th>
                              <th scope="col" className='text-white'>Status</th>
                              <th className='text-white'>Actions</th>

                              {/* <th scope="col">Action</th> */}
                            </tr>
                          </thead>
                          {hierarchyData.map((data, i) => {
                            // const creditRefLength = data.creditRef.length;
                            // const partnershipLength = data.partnership.length;
                            console.log('data', data);
                            return (
                              <Card
                                userName={data.userName}
                                role={data.roles[0].role}
                                key={data.id}
                                exposure={data.exposure}
                                // creditRef={data.creditRef[creditRefLength - 1]?.value}
                                balance={data.balance}
                                loadBalance={data.loadBalance}
                                refProfitLoss={data.refProfitLoss}
                                adminId={data.id}
                                // partnership={
                                //     data.partnership[partnershipLength - 1]?.value
                                // }
                                Status={data.status}
                                // creditRefLength={creditRefLength}
                                // partnershipLength={partnershipLength}
                                callingParent="HierarchyPageView"
                              />
                            );
                          })}
                        </table>
                        <Pagination
                          currentPage={paginationData.currentPage}
                          totalPages={paginationData.totalPages}
                          handlePageChange={handlePageChange}
                          startIndex={startIndex}
                          endIndex={endIndex}
                          totalData={paginationData.totalData}
                        />
                      </>
                    ) : (
                      <div className="alert text-dark bg-light" role="alert">
                        <div className="alert-text d-flex justify-content-center">
                          <b> &#128680; No Data Found !! </b>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyPageView;
