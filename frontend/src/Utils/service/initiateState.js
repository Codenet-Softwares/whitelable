export function getAdminInitialState(body = {}) {
  return {
    accessToken: body?.accessToken ?? "",
    status: body?.status ?? "",
    adminName: body?.userName ?? "",
    isLogin: body.isLogin ?? false,
    id: body?.adminId ?? "",
    roles: body?.roles ?? [],
    createdById: body?.createdById ?? null,
    createdByUser: body?.createdByUser ?? null,
    AdminWallet: body?.balance ?? null,
  };
}

export function getAuthForm(body = {}) {
  return {
    userName: "",
    password: "",
  };
}

export function getAllCreateState(body = {}) {
  return {
    userList: [],
    currentPage: 1,
    totalPages: "",
    totalEntries: 10,
    name: "",
    totalData: "",
  };
}

export function getCreditRefAndPartnership(body = {}) {
  return {
    data: [
      {
        date: "",
        value: 0,
      },
    ],
  };
}

export function getCreateSubAdmin(body = {}) {
  return {
    userName: "",
    password: "",
    roles: [
      {
        permission: [],
      },
    ],
  };
}

export function getAllSubAdminCreateState(body = {}) {
  return {
    userList: [],
    currentPage: 1,
    totalPages: "",
    totalEntries: 10,
    name: "",
    totalData: "",
  };
}

export function getSubAdminPermissionData(body = {}) {
  return {
    userName: "",
    roles: [],
  };
}

export function getHierarchyState(body = {}) {
  return {
    path: [],
    userDetails: {},
    currentPage: 0,
    totalPages: 0,
    totalEntries: 5,
  };
}

export function adminAccountStatement(body = {}) {
  return {
    accountDetails: [],
    currentPage: 1,
    totalPages: "",
    totalEntries: 10,
    name: "",
    totalData: "",
  };
}

export function accountStatementInitialState(body = {}) {
  return {
    statementView: [],
    activityView: [],
    profileView: {
      roles: [
        {
          role: null,
        },
      ],
    },
    toggle: 1,
    activeItem: "statement",
    currentPage: 1,
    totalPages: 0,
    endDate: "",
    totalData: 0,
    startDate: "",
    totalEntries: 10,
    dataSource: "live",
    backupStartDate: null,
    backupEndDate: null,
  };
}

export function activeInactiveInitialState(body = {}) {
  return {
    active: true,
    btncolor1: false,
    btncolor2: false,
    btncolor3: false,
    lock: true,
    password: "",
    isClicked: false,
  };
}

export function adminAccountStatementInitialState() {
  return {
    statement: [],
    currentPage: 1,
    totalPages: 0,
    totalEntries: 10,
    totalData: 0,
    endDate: "",
    startDate: "",
    dataSource: "live",
  };
}
export function view_AddCashHistory_InitialState() {
  return {
    history: [],
    currentPage: 1,
    totalPages: 0,
    totalEntries: 10,
    totalData: 0,
  };
}
export function get_liveGames(body = {}) {
  return {
    data: [],
    currentPage: 1,
    totalPages: "",
    totalEntries: 10,
    search: "",
    totalData: "",
    type: "",
  };
}

export function getMarketWithRunnerDataInitialState(body = {}) {
  return {
    marketId: "",
    marketName: "",
    participants: null,
    timeSpan: "",
    status: null,
    runners: [
      {
        runnerName: {
          runnerId: "",
          name: "",
        },
        rate: [
          {
            back: null,
            lay: null,
            _id: "",
          },
        ],
        _id: "",
      },
    ],
    _id: "",
  };
}

export const getAdminResetPasswordInitialState = (body = {}) => {
  return {
    userName: body.userName || "",
    oldPassword: body.oldPassword || "",
    newPassword: body.newPassword || "",
    confirmPassword: body.confirmPassword || "",
  };
};

export function get_betBook(body = {}) {
  return {
    marketId: "",
    adminId: "",
    role: "",
    type: "",
  };
}

// initial state for event P&L
export const getUseProfitLossState = (body = {}) => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return {
    dataType: "live",
    dateRange: { from: getTodayDate(), to: getTodayDate() },
    loading: false,
    shouldDisableButton: true,
    preventAPICall: false, 
    tableRefreshKey: 0,
    currentLevel: 1,
    parentData: null,
    grandParentData: null,
    greatGrandParentData: null,
    levelRefreshKey: 0,
    ...body,
  };
};
