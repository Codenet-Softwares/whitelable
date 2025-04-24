import { useEffect, useState } from "react";
import { accountInitialState } from "../Utils/service/initiateState";
import { getActivityLog_api, getAllTransactionView, getBetHistory, getUserProfileView } from "../Utils/service/apiService";


const useProfileLandingModalData = (toggle) => {
    const [state, setState] = useState(accountInitialState());
    const userName = "Ajuba_user"

    const getAll_transactionView = async () => {
        if (!userName) return;

        try {
            const response = await getAllTransactionView({
                userName,
                pageNumber: state.statementView.currentPage,
                fromDate: state.statementView.startDate,
                toDate: state.statementView.endDate,
                limit: state.statementView.totalEntries,
                dataSource: state.statementView.dataSource,
            });

            setState((prevState) => ({
                ...prevState,
                statementView: {
                    ...prevState.statementView,
                    data: response.data,
                    totalPages: response?.pagination?.totalPages,
                    totalData: response?.pagination?.totalItems,
                },
            }));
        } catch (error) {
            console.error("Error fetching transaction data:", error);
        }
    };

    const getActivityLog = async () => {
        if (!userName) return;

        const response = await getActivityLog_api({ userName });
        setState((prevState) => ({
            ...prevState,
            activityLogView: {
                ...prevState.activityLogView,
                data: response.data,
            },
        }));
    }

    const getProfileView = async () => {
        if (!userName) return;

        const response = await getUserProfileView({ userName });
        setState((prevState) => ({
            ...prevState,
            profileView: {
                ...prevState.profileView,
                data: response.data,
            },
        }));
    }

 async function getHistoryForBetHistory() {
     if (!userName) return;

    const response = await getBetHistory({
      userName,
    //   gameId: betHistoryData.SelectedGameId,
    //   fromDate: formatDate(betHistoryData.startDate),
    //   toDate: formatDate(betHistoryData.endDate),
    //   page: betHistoryData.currentPage || "1",
    //   limit: betHistoryData.itemPerPage || "10",
    //   dataSource: betHistoryData.dataSource,
    //   dataType: betHistoryData.dataType,
    });
     setState((prevState) => ({
         ...prevState,
         betHistoryView: {
             ...prevState.betHistoryView,
             data: response.data,
             totalPages: response?.pagination?.totalPages,
             totalData: response?.pagination?.totalItems,
         },
     }));
  }

    useEffect(() => {
        if (userName) {
            switch (toggle) {
                case "Statement":
                    getAll_transactionView();
                    break;
                case "activity":
                    getActivityLog();
                    break;
                case "profile":
                    getProfileView();
                    break;
                case "betHistory":
                    getHistoryForBetHistory();
                    break;
                case "profit_loss":
                    getActivityLog();
                    break;
                default:
                    break;
            }
        }
    }, [userName, toggle]);




    return {

    }
}

export default useProfileLandingModalData;